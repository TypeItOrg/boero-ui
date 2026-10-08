import { createAuthRequestHeaders } from "@common/utils/auth-request-headers.util";
import { publicApiFetch } from "@common/services/public-api-fetch.service";
import type { BackendError } from "@common/types/backend-error.types";
import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import type { InstitutionalLoginResult } from "@features/institutional-auth/types/institutional-login-result.types";
import type { DiscoverablePasskeyVerifyInput } from "@features/institutional-auth/types/discoverable-passkey-verify-input.types";

export type PasskeyAuthVerifyInput = {
  loginAttemptId: string;
  ceremonyId: string;
  credential: unknown;
  rememberMe: boolean;
};

export type PasskeyAuthVerifyOutput = { success: true; data: InstitutionalLoginResult } | { success: false; error: BackendError };

export async function verifyPasskeyAuth(input: PasskeyAuthVerifyInput, requestHeaders: Pick<Headers, "get">): Promise<PasskeyAuthVerifyOutput> {
  return verify("/api/v1/auth/passkeys/authentication/verify", input, requestHeaders);
}

export async function verifyDiscoverablePasskeyAuth(
  input: DiscoverablePasskeyVerifyInput,
  requestHeaders: Pick<Headers, "get">,
): Promise<PasskeyAuthVerifyOutput> {
  return verify("/api/v1/auth/passkeys/authentication/discoverable/verify", input, requestHeaders);
}

async function verify(
  path: string,
  input: PasskeyAuthVerifyInput | DiscoverablePasskeyVerifyInput,
  requestHeaders: Pick<Headers, "get">,
): Promise<PasskeyAuthVerifyOutput> {
  try {
    const response = await publicApiFetch(path, {
      body: JSON.stringify(input),
      cache: "no-store",
      headers: createAuthRequestHeaders(requestHeaders),
      method: "POST",
    });

    if (!response.ok) {
      const error = (await response.json()) as BackendError;
      return { success: false, error };
    }

    return { success: true, data: (await response.json()) as InstitutionalLoginResult };
  } catch {
    return {
      success: false,
      error: { status: 500, message: INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSKEY_CONNECTION_FAILED },
    };
  }
}
