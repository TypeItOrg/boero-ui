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

type PlatformRefreshTokens = {
  accessToken: string;
  refreshToken: string;
};

type PlatformRefreshAttempt = {
  status?: number;
  tokens?: PlatformRefreshTokens;
};

const inFlightPlatformRefreshes = new Map<string, Promise<PlatformRefreshAttempt>>();

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const hasAccessToken = request.cookies.has(PLATFORM_ACCESS_TOKEN_COOKIE);
  const refreshToken = request.cookies.get(PLATFORM_REFRESH_TOKEN_COOKIE)?.value;

  const requiresPlatformSession = pathname === "/" || pathname === "/platform" || pathname.startsWith("/platform/");

  if (requiresPlatformSession && hasAccessToken) {
    return NextResponse.next();
  }

  if (requiresPlatformSession) {
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
    const redirectResponse = NextResponse.redirect(
      new URL(getRedirectPath("/auth/platform/login", nextParam), request.url),
    );

    if (refreshStatus === 401) {
      redirectResponse.cookies.delete(PLATFORM_ACCESS_TOKEN_COOKIE);
      redirectResponse.cookies.delete(PLATFORM_REFRESH_TOKEN_COOKIE);
    }

    return redirectResponse;
  }

  if (pathname === "/auth/platform/login" && hasAccessToken) {
    const next = request.nextUrl.searchParams.get("next");
    return NextResponse.redirect(new URL(getSafeNextPath(next), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/auth/platform/login", "/platform/:path*"],
};

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
    const response = await fetch(new URL("/api/v1/auth/platform/refresh", getApiUrlOrThrow()), {
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

function removeInFlightPlatformRefresh(refreshToken: string, refreshRequest: Promise<PlatformRefreshAttempt>): void {
  if (inFlightPlatformRefreshes.get(refreshToken) === refreshRequest) {
    inFlightPlatformRefreshes.delete(refreshToken);
  }
}
