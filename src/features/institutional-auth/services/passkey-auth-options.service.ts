import { getApiUrlOrThrow } from "@common/utils/get-api-url-or-throw.util";
import type { BackendError } from "@common/types/backend-error.types";
import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import type { PasskeyRequestOptionsJson } from "@features/institutional-auth/types/passkey-request-options-json.types";

export type PasskeyAuthOptionsOutput =
  { success: true; data: { ceremonyId: string; options: PasskeyRequestOptionsJson } } | { success: false; error: BackendError };

export async function requestPasskeyAuthOptions(loginAttemptId: string): Promise<PasskeyAuthOptionsOutput> {
  try {
    const response = await fetch(new URL("/api/v1/auth/passkeys/authentication/options", getApiUrlOrThrow()), {
      body: JSON.stringify({ loginAttemptId }),
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      const error = (await response.json()) as BackendError;
      return { success: false, error };
    }

    return {
      success: true,
      data: (await response.json()) as { ceremonyId: string; options: PasskeyRequestOptionsJson },
    };
  } catch {
    return {
      success: false,
      error: { status: 500, message: INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSKEY_CONNECTION_FAILED },
    };
  }
}
