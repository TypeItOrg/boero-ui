import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import type { AuthProxyPolicy } from "@common/services/auth-proxy/auth-proxy-policy.types";
import type { RefreshedTokens } from "@common/services/auth-proxy/refreshed-tokens.types";
import {
  getPlatformAuthCookieOptions,
  PLATFORM_ACCESS_TOKEN_COOKIE,
  PLATFORM_ACCESS_TOKEN_MAX_AGE,
  PLATFORM_REFRESH_TOKEN_COOKIE,
  PLATFORM_REFRESH_TOKEN_MAX_AGE,
} from "@features/platform-auth/utils/platform-auth-cookies.util";
import { getSafeNextPath, getRedirectPath } from "@features/platform-auth/utils/platform-auth-paths.util";

export const PLATFORM_LOGIN_PATH = "/admin/auth/login";
export const PLATFORM_REFRESH_PATH = "/api/v1/admin/auth/refresh";
export const PLATFORM_CURRENT_USER_PATH = "/api/v1/admin/auth/me";

export const platformAuthProxyPolicy: AuthProxyPolicy = {
  accessTokenCookie: PLATFORM_ACCESS_TOKEN_COOKIE,
  refreshTokenCookie: PLATFORM_REFRESH_TOKEN_COOKIE,
  refreshPath: PLATFORM_REFRESH_PATH,
  currentUserPath: PLATFORM_CURRENT_USER_PATH,
  getLoginRedirect(request: NextRequest): URL {
    const next = request.nextUrl.pathname + request.nextUrl.search;
    return new URL(getRedirectPath(PLATFORM_LOGIN_PATH, next), request.url);
  },
  getAuthenticatedRedirect(request: NextRequest): URL {
    const next = request.nextUrl.searchParams.get("next");
    return new URL(getSafeNextPath(next), request.url);
  },
  setRefreshedCookies(response: NextResponse, tokens: RefreshedTokens): void {
    response.cookies.set(PLATFORM_ACCESS_TOKEN_COOKIE, tokens.accessToken, {
      ...getPlatformAuthCookieOptions(PLATFORM_ACCESS_TOKEN_MAX_AGE),
    });
    response.cookies.set(PLATFORM_REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      ...getPlatformAuthCookieOptions(PLATFORM_REFRESH_TOKEN_MAX_AGE),
    });
  },
  clearCookies(response: NextResponse): void {
    response.cookies.delete(PLATFORM_ACCESS_TOKEN_COOKIE);
    response.cookies.delete(PLATFORM_REFRESH_TOKEN_COOKIE);
  },
};
