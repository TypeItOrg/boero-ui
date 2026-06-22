import type { BackendError } from "../types/backend-error.types";
import type { LoginPlatformAccountOutput } from "../types/login-platform-account-output.types";
import type { PlatformLoginInput } from "../types/platform-login-input.types";
import type { PlatformLoginResult } from "../types/platform-login-result.types";

const apiUrl = process.env.BOERO_API_URL ?? "http://localhost:8080";

export async function loginPlatformAccount(
  input: PlatformLoginInput,
): Promise<LoginPlatformAccountOutput> {
  const response = await fetch(`${apiUrl}/api/v1/auth/platform/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = (await response.json()) as BackendError;
    return { success: false, error };
  }

  const data = (await response.json()) as PlatformLoginResult;
  return { success: true, data };
}
