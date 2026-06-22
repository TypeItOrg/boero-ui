import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { PLATFORM_ACCESS_TOKEN_COOKIE } from "@features/platform-auth/cookies/platform-auth-cookies";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAccessToken = request.cookies.has(PLATFORM_ACCESS_TOKEN_COOKIE);

  if (pathname === "/auth/platform/login" && hasAccessToken) {
    return NextResponse.redirect(new URL("/platform/dashboard", request.url));
  }

  if (pathname.startsWith("/platform/") && !hasAccessToken) {
    return NextResponse.redirect(new URL("/auth/platform/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/platform/login", "/platform/:path*"],
};
