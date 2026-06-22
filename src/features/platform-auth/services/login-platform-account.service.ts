import type { BackendError } from "@features/platform-auth/types/backend-error.types";
import type { LoginPlatformAccountOutput } from "@features/platform-auth/types/login-platform-account-output.types";
import type { PlatformLoginInput } from "@features/platform-auth/types/platform-login-input.types";
import type { PlatformLoginResult } from "@features/platform-auth/types/platform-login-result.types";

const apiUrl = process.env.BOERO_API_URL ?? "http://localhost:8080";

export async function loginPlatformAccount(input: PlatformLoginInput): Promise<LoginPlatformAccountOutput> {
  const response = await fetch(`${apiUrl}/api/v1/auth/platform/login`, {
    body: JSON.stringify(input),
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    const error = (await response.json()) as BackendError;
    return { success: false, error };
  }

  const data = (await response.json()) as PlatformLoginResult;
  return { success: true, data };
}
