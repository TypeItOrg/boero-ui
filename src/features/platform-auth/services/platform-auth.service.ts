import { cookies } from "next/headers";

import type { BackendError } from "../types/backend-error.types";
import type { PlatformAccount } from "../types/platform-account.types";
import type { PlatformLoginInput } from "../types/platform-login-input.types";
import type { PlatformLoginResult } from "../types/platform-login-result.types";
import { PLATFORM_ACCESS_TOKEN_COOKIE } from "../utils/platform-auth-cookies.util";

const apiUrl = process.env.BOERO_API_URL ?? "http://localhost:8080";

function getBackendMessage(payload: unknown, fallback: string) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }

  return fallback;
}

export async function loginPlatformAccount(
  input: PlatformLoginInput,
): Promise<PlatformLoginResult> {
  const response = await fetch(`${apiUrl}/api/v1/auth/platform/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  const payload = (await response.json()) as PlatformLoginResult | BackendError;

  if (!response.ok) {
    throw new Error(getBackendMessage(payload, "No pudimos iniciar sesión."));
  }

  return payload as PlatformLoginResult;
}

export async function getPlatformAccount(): Promise<PlatformAccount | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(PLATFORM_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  const response = await fetch(`${apiUrl}/api/v1/auth/platform/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { account: PlatformAccount };

  return payload.account;
}
