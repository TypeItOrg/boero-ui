import type { Passkey } from "@features/institutional-auth/types/passkey.types";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

export async function renamePasskey(id: string, label: string): Promise<Passkey> {
  const response = await institutionalApiFetch(`/api/v1/auth/passkeys/${id}`, {
    body: JSON.stringify({ label }),
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error("No se pudo renombrar la passkey.");
  }

  return (await response.json()) as Passkey;
}
