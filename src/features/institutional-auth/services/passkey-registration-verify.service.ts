import type { Passkey } from "@features/institutional-auth/types/passkey.types";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { readBackendErrorCode } from "@features/institutional-auth/utils/backend-error-code.util";

import { RECENT_AUTH_REQUIRED } from "@features/institutional-auth/constants/passkey.constants";

export async function verifyPasskeyRegistration(ceremonyId: string, credential: unknown): Promise<Passkey> {
  const response = await institutionalApiFetch("/api/v1/auth/passkeys/registration/verify", {
    body: JSON.stringify({ ceremonyId, credential }),
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (response.status === 403 && (await readBackendErrorCode(response)) === RECENT_AUTH_REQUIRED) {
    throw new Error(RECENT_AUTH_REQUIRED);
  }

  if (!response.ok) {
    throw new Error("No se pudo registrar la passkey.");
  }

  return (await response.json()) as Passkey;
}
