import type { NextRequest, NextResponse } from "next/server";

export type RefreshedTokens = {
  accessToken: string;
  refreshToken: string;
};

export type RefreshAttempt = {
  status?: number;
  tokens?: RefreshedTokens;
};

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
