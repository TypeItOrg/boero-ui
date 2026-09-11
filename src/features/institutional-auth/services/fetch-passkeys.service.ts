import type { PasskeyList } from "@features/institutional-auth/types/passkey-list.types";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

export async function fetchPasskeys(): Promise<PasskeyList> {
  const response = await institutionalApiFetch("/api/v1/auth/passkeys", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("No se pudieron cargar las passkeys.");
  }

  return (await response.json()) as PasskeyList;
}
