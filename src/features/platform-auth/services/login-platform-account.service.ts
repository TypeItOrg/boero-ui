import { getBackendMessage } from "@common/utils/get-backend-message.util";

import type { BackendError } from "../types/backend-error.types";
import type { PlatformLoginInput } from "../types/platform-login-input.types";
import type { PlatformLoginResult } from "../types/platform-login-result.types";

const apiUrl = process.env.BOERO_API_URL ?? "http://localhost:8080";

export async function loginPlatformAccount(input: PlatformLoginInput): Promise<PlatformLoginResult> {
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
