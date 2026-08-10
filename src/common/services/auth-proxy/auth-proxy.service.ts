import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getApiUrlOrThrow } from "@common/utils/get-api-url-or-throw.util";
import type { AuthProxyPolicy } from "@common/services/auth-proxy/auth-proxy-policy.types";
import type { RefreshAttempt } from "@common/services/auth-proxy/refresh-attempt.types";
import type { RefreshedTokens } from "@common/services/auth-proxy/refreshed-tokens.types";

const inFlightRefreshes = new Map<string, Promise<RefreshAttempt>>();
const AUTH_PROXY_REQUEST_TIMEOUT_MS = 15_000;

export async function handleGuestOnlyRoute(request: NextRequest, policy: AuthProxyPolicy): Promise<NextResponse> {
  const accessToken = request.cookies.get(policy.accessTokenCookie)?.value;
  if (!accessToken) return NextResponse.next();

  const sessionStatus = await getSessionStatus(policy.currentUserPath, accessToken);
  if (sessionStatus !== "valid") {
    const response = NextResponse.next();
    if (sessionStatus === "invalid") policy.clearCookies(response);
    return response;
  }

  return NextResponse.redirect(policy.getAuthenticatedRedirect(request));
}

export async function handleProtectedRoute(request: NextRequest, policy: AuthProxyPolicy): Promise<NextResponse> {
  if (request.cookies.has(policy.accessTokenCookie)) return NextResponse.next();

  const refreshToken = request.cookies.get(policy.refreshTokenCookie)?.value;
  if (!refreshToken) return createLoginRedirectResponse(request, policy);

  const refreshAttempt = await refreshSession(policy.refreshPath, refreshToken);
  if (refreshAttempt.tokens) return createRefreshedSessionResponse(request, policy, refreshAttempt.tokens);

  return createLoginRedirectResponse(request, policy, refreshAttempt.status);
}

async function getSessionStatus(
  currentUserPath: string,
  accessToken: string,
): Promise<"valid" | "invalid" | "unavailable"> {
  try {
    const response = await fetch(new URL(currentUserPath, getApiUrlOrThrow()), {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(AUTH_PROXY_REQUEST_TIMEOUT_MS),
    });

    if (response.ok) return "valid";
    if (response.status === 401) return "invalid";
    return "unavailable";
  } catch {
    return "unavailable";
  }
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
      signal: AbortSignal.timeout(AUTH_PROXY_REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) return { status: response.status };

    const payload = (await response.json()) as { tokens?: Partial<RefreshedTokens> };
    const tokens = payload.tokens;
    if (tokens?.accessToken && tokens.refreshToken) {
      return {
        status: response.status,
        tokens: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
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

function createLoginRedirectResponse(
  request: NextRequest,
  policy: AuthProxyPolicy,
  refreshStatus?: number,
): NextResponse {
  const response = NextResponse.redirect(policy.getLoginRedirect(request));
  if (refreshStatus === 401) policy.clearCookies(response);
  return response;
}

function createRefreshedSessionResponse(
  request: NextRequest,
  policy: AuthProxyPolicy,
  tokens: RefreshedTokens,
): NextResponse {
  request.cookies.set(policy.accessTokenCookie, tokens.accessToken);
  request.cookies.set(policy.refreshTokenCookie, tokens.refreshToken);

  const response = NextResponse.next({
    request: { headers: new Headers(request.headers) },
  });
  policy.setRefreshedCookies(response, tokens);
  return response;
}
