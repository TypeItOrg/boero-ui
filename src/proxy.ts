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

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const hasAccessToken = request.cookies.has(PLATFORM_ACCESS_TOKEN_COOKIE);
  const refreshToken = request.cookies.get(PLATFORM_REFRESH_TOKEN_COOKIE)?.value;

  const requiresPlatformSession = pathname === "/" || pathname === "/platform" || pathname.startsWith("/platform/");

  if (requiresPlatformSession && hasAccessToken) {
    return NextResponse.next();
  }

  if (requiresPlatformSession) {
    if (refreshToken) {
      try {
        const response = await fetch(new URL("/api/v1/auth/platform/refresh", getApiUrlOrThrow()), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
          const payload = await response.json();
          const tokens = payload.tokens;

          if (tokens?.accessToken && tokens?.refreshToken) {
            const nextResponse = NextResponse.next();

            setPlatformAuthResponseCookies(nextResponse, tokens.accessToken, tokens.refreshToken);

            return nextResponse;
          }
        }
      } catch {}
    }

    const nextParam = request.nextUrl.pathname + request.nextUrl.search;
    const redirectResponse = NextResponse.redirect(
      new URL(getRedirectPath("/auth/platform/login", nextParam), request.url),
    );

    redirectResponse.cookies.delete(PLATFORM_ACCESS_TOKEN_COOKIE);
    redirectResponse.cookies.delete(PLATFORM_REFRESH_TOKEN_COOKIE);
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
