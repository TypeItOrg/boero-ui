import { getApiUrlOrThrow } from "@common/utils/get-api-url-or-throw.util";
import type { BackendError } from "@common/types/backend-error.types";
import type { LoginPlatformAccountOutput } from "@features/platform-auth/types/login-platform-account-output.types";
import type { PlatformLoginInput } from "@features/platform-auth/types/platform-login-input.types";
import type { PlatformLoginResult } from "@features/platform-auth/types/platform-login-result.types";

export async function loginPlatformAccount(input: PlatformLoginInput): Promise<LoginPlatformAccountOutput> {
  const response = await fetch(new URL("/api/v1/admin/auth/login", getApiUrlOrThrow()), {
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
