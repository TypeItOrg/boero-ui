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

type PlatformRefreshTokens = {
  accessToken: string;
  refreshToken: string;
};

type PlatformRefreshAttempt = {
  status?: number;
  tokens?: PlatformRefreshTokens;
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

const inFlightPlatformRefreshes = new Map<string, Promise<PlatformRefreshAttempt>>();

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const routeAccess = getRouteAccess(request.nextUrl.pathname);

  switch (routeAccess) {
    case RouteAccess.AdminGuestOnly:
      return handleGuestOnlyRoute(request, PLATFORM_ACCESS_TOKEN_COOKIE, ADMIN_LOGIN_PATH);
    case RouteAccess.AdminSession:
      return handleAdminRoute(request);
    case RouteAccess.InstitutionalGuestOnly:
      return handleGuestOnlyRoute(request, INSTITUTIONAL_ACCESS_TOKEN_COOKIE, INSTITUTIONAL_LOGIN_PATH);
    case RouteAccess.InstitutionalSession:
      return handleInstitutionalRoute(request);
    case RouteAccess.Public:
      return NextResponse.next();
  }
}

export const config = {
  matcher: ["/", "/admin/:path*", "/auth/login"],
};

function getRouteAccess(pathname: string): RouteAccess {
  if (pathname === ADMIN_LOGIN_PATH) {
    return RouteAccess.AdminGuestOnly;
  }

  if (pathname === INSTITUTIONAL_LOGIN_PATH) {
    return RouteAccess.InstitutionalGuestOnly;
  }

  if (pathname === ROOT_PATH) {
    return RouteAccess.InstitutionalSession;
  }

  if (isAdminRoute(pathname)) {
    return RouteAccess.AdminSession;
  }

  return RouteAccess.Public;
}

function isAdminRoute(pathname: string): boolean {
  return pathname === ADMIN_ROOT_PATH || pathname.startsWith(`${ADMIN_ROOT_PATH}/`);
}

function handleGuestOnlyRoute(request: NextRequest, accessCookie: string, loginPath: string): NextResponse {
  if (!request.cookies.has(accessCookie)) {
    return NextResponse.next();
  }

  const next = request.nextUrl.searchParams.get("next");
  const fallback = loginPath === ADMIN_LOGIN_PATH ? getSafeNextPath(next) : next || ROOT_PATH;
  return NextResponse.redirect(new URL(fallback, request.url));
}

async function handleAdminRoute(request: NextRequest): Promise<NextResponse> {
  if (request.cookies.has(PLATFORM_ACCESS_TOKEN_COOKIE)) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get(PLATFORM_REFRESH_TOKEN_COOKIE)?.value;
  let refreshStatus: number | undefined;

  if (refreshToken) {
    const refreshAttempt = await refreshPlatformSession(refreshToken);
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
    const refreshAttempt = await refreshInstitutionalSession(refreshToken);
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

function refreshPlatformSession(refreshToken: string): Promise<PlatformRefreshAttempt> {
  const existingRequest = inFlightPlatformRefreshes.get(refreshToken);
  if (existingRequest) return existingRequest;

  const refreshRequest = performPlatformRefresh(refreshToken);
  inFlightPlatformRefreshes.set(refreshToken, refreshRequest);

  void refreshRequest.then(
    () => removeInFlightPlatformRefresh(refreshToken, refreshRequest),
    () => removeInFlightPlatformRefresh(refreshToken, refreshRequest),
  );

  return refreshRequest;
}

async function performPlatformRefresh(refreshToken: string): Promise<PlatformRefreshAttempt> {
  try {
    const response = await fetch(new URL("/api/v1/admin/auth/refresh", getApiUrlOrThrow()), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return { status: response.status };

    const payload = (await response.json()) as { tokens?: Partial<PlatformRefreshTokens> };
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

function refreshInstitutionalSession(refreshToken: string): Promise<PlatformRefreshAttempt> {
  const refreshRequest = fetch(new URL("/api/v1/auth/refresh", getApiUrlOrThrow()), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (response) => {
      if (!response.ok) return { status: response.status };

      const payload = (await response.json()) as { tokens?: Partial<PlatformRefreshTokens> };
      const tokens = payload.tokens;
      if (tokens?.accessToken && tokens.refreshToken) {
        return {
          status: response.status,
          tokens: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
        };
      }

      return { status: response.status };
    })
    .catch(() => ({}));

  return refreshRequest;
}

function removeInFlightPlatformRefresh(refreshToken: string, refreshRequest: Promise<PlatformRefreshAttempt>): void {
  if (inFlightPlatformRefreshes.get(refreshToken) === refreshRequest) {
    inFlightPlatformRefreshes.delete(refreshToken);
  }
}
