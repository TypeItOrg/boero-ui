import type { NextRequest, NextResponse } from "next/server";

import type { RefreshedTokens } from "@common/services/auth-proxy/refreshed-tokens.types";

export type AuthProxyPolicy = {
  accessTokenCookie: string;
  refreshTokenCookie: string;
  refreshPath: string;
  currentUserPath: string;
  getLoginRedirect(request: NextRequest): URL;
  getAuthenticatedRedirect(request: NextRequest): URL;
  setRefreshedCookies(response: NextResponse, tokens: RefreshedTokens): void;
  clearCookies(response: NextResponse): void;
};
