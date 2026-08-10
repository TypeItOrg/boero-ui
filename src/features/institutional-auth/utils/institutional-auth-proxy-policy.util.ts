import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import type { AuthProxyPolicy } from "@common/services/auth-proxy/auth-proxy-policy.types";
import type { RefreshedTokens } from "@common/services/auth-proxy/refreshed-tokens.types";
import {
  getInstitutionalAuthCookieOptions,
  INSTITUTIONAL_ACCESS_TOKEN_COOKIE,
  INSTITUTIONAL_ACCESS_TOKEN_MAX_AGE,
  INSTITUTIONAL_REFRESH_TOKEN_COOKIE,
  INSTITUTIONAL_REFRESH_TOKEN_MAX_AGE,
} from "@features/institutional-auth/utils/institutional-auth-cookies.util";

export const INSTITUTIONAL_LOGIN_PATH = "/auth/login";
export const INSTITUTIONAL_REFRESH_PATH = "/api/v1/auth/refresh";
export const INSTITUTIONAL_CURRENT_USER_PATH = "/api/v1/auth/me";

export const institutionalAuthProxyPolicy: AuthProxyPolicy = {
  accessTokenCookie: INSTITUTIONAL_ACCESS_TOKEN_COOKIE,
  refreshTokenCookie: INSTITUTIONAL_REFRESH_TOKEN_COOKIE,
  refreshPath: INSTITUTIONAL_REFRESH_PATH,
  currentUserPath: INSTITUTIONAL_CURRENT_USER_PATH,
  getLoginRedirect(request: NextRequest): URL {
    return new URL(INSTITUTIONAL_LOGIN_PATH, request.url);
  },
  getAuthenticatedRedirect(request: NextRequest): URL {
    return new URL("/", request.url);
  },
  setRefreshedCookies(response: NextResponse, tokens: RefreshedTokens): void {
    response.cookies.set(INSTITUTIONAL_ACCESS_TOKEN_COOKIE, tokens.accessToken, {
      ...getInstitutionalAuthCookieOptions(INSTITUTIONAL_ACCESS_TOKEN_MAX_AGE),
    });
    response.cookies.set(INSTITUTIONAL_REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      ...getInstitutionalAuthCookieOptions(INSTITUTIONAL_REFRESH_TOKEN_MAX_AGE),
    });
  },
  clearCookies(response: NextResponse): void {
    response.cookies.delete(INSTITUTIONAL_ACCESS_TOKEN_COOKIE);
    response.cookies.delete(INSTITUTIONAL_REFRESH_TOKEN_COOKIE);
  },
};
