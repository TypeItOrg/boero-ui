import { expect, type APIRequestContext, type APIResponse } from "@playwright/test";
import type { AcceptanceStack } from "./acceptance-stack.types";
import type { AcceptanceTenant } from "./acceptance-tenant.types";
import type { AcceptanceTokens } from "./acceptance-tokens.types";
import { tenantHeader } from "./fixture.helper";

export function assertStatus(response: APIResponse, expected: number, context: string): void {
  expect(response.status(), context).toBe(expected);
}

function apiUrl(stack: AcceptanceStack, path: string): string {
  if (!path.startsWith("/api/v1/") || new URL(stack.apiBase).hostname !== "127.0.0.1") {
    throw new Error("Refusing a non-loopback acceptance API target.");
  }
  return new URL(path, stack.apiBase).href;
}

export function backendUrl(stack: AcceptanceStack, path: string): string {
  return apiUrl(stack, path);
}

export async function responseTokens(response: APIResponse): Promise<AcceptanceTokens> {
  const data = (await response.json()) as { tokens?: AcceptanceTokens };
  if (!data.tokens || typeof data.tokens.accessToken !== "string" || typeof data.tokens.refreshToken !== "string") {
    throw new Error("Authentication response omitted token fields.");
  }
  return data.tokens;
}

export async function platformTokens(api: APIRequestContext, stack: AcceptanceStack): Promise<AcceptanceTokens> {
  const response = await api.post(apiUrl(stack, "/api/v1/admin/auth/login"), { data: { ...stack.admin, rememberMe: false } });
  assertStatus(response, 200, "Private platform fixture login");
  return responseTokens(response);
}

export async function institutionTokens(api: APIRequestContext, stack: AcceptanceStack, institution: AcceptanceTenant): Promise<AcceptanceTokens> {
  const identified = await api.post(apiUrl(stack, "/api/v1/auth/login/identify"), {
    headers: tenantHeader(stack, institution),
    data: { institutionId: institution.id, documentNumber: institution.document },
  });
  assertStatus(identified, 200, "Private institutional fixture identify");
  const identity = (await identified.json()) as { loginAttemptId?: string };
  if (!identity.loginAttemptId) {
    throw new Error("Verified fixture did not produce a login attempt.");
  }
  const loggedIn = await api.post(apiUrl(stack, "/api/v1/auth/login/password"), {
    headers: tenantHeader(stack, institution),
    data: { loginAttemptId: identity.loginAttemptId, password: institution.password, rememberMe: false },
  });
  assertStatus(loggedIn, 200, "Private institutional fixture password login");
  return responseTokens(loggedIn);
}

export async function setLogo(api: APIRequestContext, stack: AcceptanceStack, institution: AcceptanceTenant, bytes: Buffer | null): Promise<void> {
  const tokens = await platformTokens(api, stack);
  const url = apiUrl(stack, `/api/v1/admin/institutions/${institution.id}/logo`);
  const headers = { Authorization: `Bearer ${tokens.accessToken}` };
  const response = bytes
    ? await api.put(url, { headers, multipart: { file: { name: "synthetic-acceptance.png", mimeType: "image/png", buffer: bytes } } })
    : await api.delete(url, { headers });
  assertStatus(response, bytes ? 200 : 204, "Synthetic logo fixture setup");
}
