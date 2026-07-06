import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  PLATFORM_ACCESS_TOKEN_COOKIE,
  PLATFORM_REFRESH_TOKEN_COOKIE,
} from "@features/platform-auth/utils/platform-auth-cookies.util";

import { getSafeNextPath, getRedirectPath } from "@features/platform-auth/utils/platform-auth-paths.util";

const API_URL = process.env.BOERO_API_URL ?? "http://172.17.0.1:8080";

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const hasAccessToken = request.cookies.has(PLATFORM_ACCESS_TOKEN_COOKIE);
  const refreshToken = request.cookies.get(PLATFORM_REFRESH_TOKEN_COOKIE)?.value;

  if (pathname.startsWith("/platform/") && hasAccessToken) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/platform/")) {
    // Try silent refresh if refresh token is present
    if (refreshToken) {
      try {
        const response = await fetch(`${API_URL}/api/v1/auth/platform/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
          const payload = await response.json();
          const tokens = payload.tokens;

          if (tokens?.accessToken && tokens?.refreshToken) {
            const nextResponse = NextResponse.next();
            const secure = process.env.NODE_ENV === "production";

            nextResponse.cookies.set(PLATFORM_ACCESS_TOKEN_COOKIE, tokens.accessToken, {
              httpOnly: true,
              sameSite: "lax",
              secure,
              path: "/",
              maxAge: 60 * 15,
            });

            nextResponse.cookies.set(PLATFORM_REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
              httpOnly: true,
              sameSite: "lax",
              secure,
              path: "/",
              maxAge: 60 * 60 * 24 * 30,
            });

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

  // Redirect to dashboard if already authenticated and trying to access login
  if (pathname === "/auth/platform/login" && hasAccessToken) {
    const next = request.nextUrl.searchParams.get("next");
    return NextResponse.redirect(new URL(getSafeNextPath(next), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/platform/login", "/platform/:path*"],
};
