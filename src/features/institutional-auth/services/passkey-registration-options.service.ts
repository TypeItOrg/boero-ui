import type { PasskeyCreationOptionsJson } from "@features/institutional-auth/types/passkey-creation-options-json.types";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { readBackendErrorCode } from "@features/institutional-auth/utils/backend-error-code.util";

import { RECENT_AUTH_REQUIRED } from "@features/institutional-auth/constants/passkey.constants";

export async function requestPasskeyRegistrationOptions(label: string): Promise<{
  ceremonyId: string;
  options: PasskeyCreationOptionsJson;
}> {
  const response = await institutionalApiFetch("/api/v1/auth/passkeys/registration/options", {
    body: JSON.stringify({ label }),
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (response.status === 403 && (await readBackendErrorCode(response)) === RECENT_AUTH_REQUIRED) {
    throw new Error(RECENT_AUTH_REQUIRED);
  }

  if (!response.ok) {
    throw new Error("No se pudo iniciar el registro de la passkey.");
  }

  return (await response.json()) as {
    ceremonyId: string;
    options: PasskeyCreationOptionsJson;
  };
}
