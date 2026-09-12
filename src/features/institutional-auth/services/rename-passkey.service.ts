import type { Passkey } from "@features/institutional-auth/types/passkey.types";
import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

export async function renamePasskey(id: string, label: string): Promise<Passkey> {
  const response = await institutionalApiFetch(`/api/v1/auth/passkeys/${id}`, {
    body: JSON.stringify({ label }),
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error(INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSKEY_RENAME_FAILED);
  }

  return (await response.json()) as Passkey;
}
