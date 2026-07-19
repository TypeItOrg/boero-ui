import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getApiUrlOrThrow } from "@common/utils/get-api-url-or-throw.util";
import {
  getPlatformAuthCookieOptions,
  PLATFORM_ACCESS_TOKEN_MAX_AGE,
  PLATFORM_ACCESS_TOKEN_COOKIE,
  PLATFORM_REFRESH_TOKEN_MAX_AGE,
  PLATFORM_REFRESH_TOKEN_COOKIE,
} from "@features/platform-auth/utils/platform-auth-cookies.util";

import { getSafeNextPath, getRedirectPath } from "@features/platform-auth/utils/platform-auth-paths.util";
import {
  getInstitutionalAuthCookieOptions,
  INSTITUTIONAL_ACCESS_TOKEN_COOKIE,
  INSTITUTIONAL_ACCESS_TOKEN_MAX_AGE,
  INSTITUTIONAL_REFRESH_TOKEN_COOKIE,
  INSTITUTIONAL_REFRESH_TOKEN_MAX_AGE,
} from "@features/institutional-auth/utils/institutional-auth-cookies.util";

type RefreshTokens = {
  accessToken: string;
  refreshToken: string;
};

type RefreshAttempt = {
  status?: number;
  tokens?: RefreshTokens;
};

enum RouteAccess {
  Public,
  AdminGuestOnly,
  AdminSession,
  InstitutionalGuestOnly,
  InstitutionalSession,
}

const ROOT_PATH = "/";
const ADMIN_ROOT_PATH = "/admin";
const ADMIN_LOGIN_PATH = `${ADMIN_ROOT_PATH}/auth/login`;
const INSTITUTIONAL_LOGIN_PATH = "/auth/login";
const INSTITUTIONAL_REGISTER_PATH = "/auth/register";
const PLATFORM_REFRESH_PATH = "/api/v1/admin/auth/refresh";
const INSTITUTIONAL_REFRESH_PATH = "/api/v1/auth/refresh";
const PLATFORM_CURRENT_USER_PATH = "/api/v1/admin/auth/me";
const INSTITUTIONAL_CURRENT_USER_PATH = "/api/v1/auth/me";

const inFlightRefreshes = new Map<string, Promise<RefreshAttempt>>();

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const routeAccess = getRouteAccess(request.nextUrl.pathname);

  switch (routeAccess) {
    case RouteAccess.AdminGuestOnly:
      return handleGuestOnlyRoute(
        request,
        PLATFORM_ACCESS_TOKEN_COOKIE,
        PLATFORM_REFRESH_TOKEN_COOKIE,
        ADMIN_LOGIN_PATH,
        PLATFORM_CURRENT_USER_PATH,
      );
    case RouteAccess.AdminSession:
      return handleAdminRoute(request);
    case RouteAccess.InstitutionalGuestOnly:
      return handleGuestOnlyRoute(
        request,
        INSTITUTIONAL_ACCESS_TOKEN_COOKIE,
        INSTITUTIONAL_REFRESH_TOKEN_COOKIE,
        INSTITUTIONAL_LOGIN_PATH,
        INSTITUTIONAL_CURRENT_USER_PATH,
      );
    case RouteAccess.InstitutionalSession:
      return handleInstitutionalRoute(request);
    case RouteAccess.Public:
      return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};

function getRouteAccess(pathname: string): RouteAccess {
  if (pathname === ADMIN_LOGIN_PATH) {
    return RouteAccess.AdminGuestOnly;
  }

  if (pathname === INSTITUTIONAL_LOGIN_PATH) {
    return RouteAccess.InstitutionalGuestOnly;
  }

  if (pathname === INSTITUTIONAL_REGISTER_PATH) {
    return RouteAccess.Public;
  }

  if (isAdminRoute(pathname)) {
    return RouteAccess.AdminSession;
  }

  return RouteAccess.InstitutionalSession;
}

function isAdminRoute(pathname: string): boolean {
  return isRouteOrDescendant(pathname, ADMIN_ROOT_PATH);
}

function isRouteOrDescendant(pathname: string, routePath: string): boolean {
  return pathname === routePath || pathname.startsWith(`${routePath}/`);
}

async function handleGuestOnlyRoute(
  request: NextRequest,
  accessCookie: string,
  refreshCookie: string,
  loginPath: string,
  currentUserPath: string,
): Promise<NextResponse> {
  const accessToken = request.cookies.get(accessCookie)?.value;
  if (!accessToken) return NextResponse.next();

  const sessionStatus = await getSessionStatus(currentUserPath, accessToken);
  if (sessionStatus !== "valid") {
    const response = NextResponse.next();
    if (sessionStatus === "invalid") {
      response.cookies.delete(accessCookie);
      response.cookies.delete(refreshCookie);
    }
    return response;
  }

  const next = request.nextUrl.searchParams.get("next");
  const fallback = loginPath === ADMIN_LOGIN_PATH ? getSafeNextPath(next) : next || ROOT_PATH;
  return NextResponse.redirect(new URL(fallback, request.url));
}

async function getSessionStatus(
  currentUserPath: string,
  accessToken: string,
): Promise<"valid" | "invalid" | "unavailable"> {
  try {
    const response = await fetch(new URL(currentUserPath, getApiUrlOrThrow()), {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (response.ok) return "valid";
    if (response.status === 401) return "invalid";
    return "unavailable";
  } catch {
    return "unavailable";
  }
}

async function handleAdminRoute(request: NextRequest): Promise<NextResponse> {
  if (request.cookies.has(PLATFORM_ACCESS_TOKEN_COOKIE)) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get(PLATFORM_REFRESH_TOKEN_COOKIE)?.value;
  let refreshStatus: number | undefined;

  if (refreshToken) {
    const refreshAttempt = await refreshSession(PLATFORM_REFRESH_PATH, refreshToken);
    refreshStatus = refreshAttempt.status;

    if (refreshAttempt.tokens) {
      return createRefreshedSessionResponse(
        request,
        refreshAttempt.tokens.accessToken,
        refreshAttempt.tokens.refreshToken,
      );
    }
  }

  const nextParam = request.nextUrl.pathname + request.nextUrl.search;
  const redirectResponse = NextResponse.redirect(new URL(getRedirectPath(ADMIN_LOGIN_PATH, nextParam), request.url));

  if (refreshStatus === 401) {
    redirectResponse.cookies.delete(PLATFORM_ACCESS_TOKEN_COOKIE);
    redirectResponse.cookies.delete(PLATFORM_REFRESH_TOKEN_COOKIE);
  }

  return redirectResponse;
}

async function handleInstitutionalRoute(request: NextRequest): Promise<NextResponse> {
  if (request.cookies.has(INSTITUTIONAL_ACCESS_TOKEN_COOKIE)) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get(INSTITUTIONAL_REFRESH_TOKEN_COOKIE)?.value;
  let refreshStatus: number | undefined;

  if (refreshToken) {
    const refreshAttempt = await refreshSession(INSTITUTIONAL_REFRESH_PATH, refreshToken);
    refreshStatus = refreshAttempt.status;

    if (refreshAttempt.tokens) {
      return createRefreshedInstitutionalSessionResponse(
        request,
        refreshAttempt.tokens.accessToken,
        refreshAttempt.tokens.refreshToken,
      );
    }
  }

  const redirectResponse = NextResponse.redirect(new URL(INSTITUTIONAL_LOGIN_PATH, request.url));

  if (refreshStatus === 401) {
    redirectResponse.cookies.delete(INSTITUTIONAL_ACCESS_TOKEN_COOKIE);
    redirectResponse.cookies.delete(INSTITUTIONAL_REFRESH_TOKEN_COOKIE);
  }

  return redirectResponse;
}

function setPlatformAuthResponseCookies(response: NextResponse, accessToken: string, refreshToken: string): void {
  response.cookies.set(PLATFORM_ACCESS_TOKEN_COOKIE, accessToken, {
    ...getPlatformAuthCookieOptions(PLATFORM_ACCESS_TOKEN_MAX_AGE),
  });

  response.cookies.set(PLATFORM_REFRESH_TOKEN_COOKIE, refreshToken, {
    ...getPlatformAuthCookieOptions(PLATFORM_REFRESH_TOKEN_MAX_AGE),
  });
}

function createRefreshedSessionResponse(request: NextRequest, accessToken: string, refreshToken: string): NextResponse {
  request.cookies.set(PLATFORM_ACCESS_TOKEN_COOKIE, accessToken);
  request.cookies.set(PLATFORM_REFRESH_TOKEN_COOKIE, refreshToken);

  const response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });

  setPlatformAuthResponseCookies(response, accessToken, refreshToken);

  return response;
}

function createRefreshedInstitutionalSessionResponse(
  request: NextRequest,
  accessToken: string,
  refreshToken: string,
): NextResponse {
  request.cookies.set(INSTITUTIONAL_ACCESS_TOKEN_COOKIE, accessToken);
  request.cookies.set(INSTITUTIONAL_REFRESH_TOKEN_COOKIE, refreshToken);

  const response = NextResponse.next({
    request: { headers: new Headers(request.headers) },
  });

  response.cookies.set(INSTITUTIONAL_ACCESS_TOKEN_COOKIE, accessToken, {
    ...getInstitutionalAuthCookieOptions(INSTITUTIONAL_ACCESS_TOKEN_MAX_AGE),
  });
  response.cookies.set(INSTITUTIONAL_REFRESH_TOKEN_COOKIE, refreshToken, {
    ...getInstitutionalAuthCookieOptions(INSTITUTIONAL_REFRESH_TOKEN_MAX_AGE),
  });

  return response;
}

function refreshSession(refreshPath: string, refreshToken: string): Promise<RefreshAttempt> {
  const requestKey = `${refreshPath}:${refreshToken}`;
  const existingRequest = inFlightRefreshes.get(requestKey);
  if (existingRequest) return existingRequest;

  const refreshRequest = performRefresh(refreshPath, refreshToken);
  inFlightRefreshes.set(requestKey, refreshRequest);

  void refreshRequest.then(
    () => removeInFlightRefresh(requestKey, refreshRequest),
    () => removeInFlightRefresh(requestKey, refreshRequest),
  );

  return refreshRequest;
}

async function performRefresh(refreshPath: string, refreshToken: string): Promise<RefreshAttempt> {
  try {
    const response = await fetch(new URL(refreshPath, getApiUrlOrThrow()), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return { status: response.status };

    const payload = (await response.json()) as { tokens?: Partial<RefreshTokens> };
    const tokens = payload.tokens;

    if (tokens?.accessToken && tokens.refreshToken) {
      return {
        status: response.status,
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      };
    }

    return { status: response.status };
  } catch {
    return {};
  }
}

function removeInFlightRefresh(requestKey: string, refreshRequest: Promise<RefreshAttempt>): void {
  if (inFlightRefreshes.get(requestKey) === refreshRequest) {
    inFlightRefreshes.delete(requestKey);
  }
}
