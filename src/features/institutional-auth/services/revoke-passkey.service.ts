import { RECENT_AUTH_REQUIRED } from "@features/institutional-auth/constants/passkey.constants";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { readBackendErrorCode } from "@features/institutional-auth/utils/backend-error-code.util";

export async function revokePasskey(id: string): Promise<void> {
  const response = await institutionalApiFetch(`/api/v1/auth/passkeys/${id}`, {
    cache: "no-store",
    method: "DELETE",
  });

  if (response.status === 403 && (await readBackendErrorCode(response)) === RECENT_AUTH_REQUIRED) {
    throw new Error(RECENT_AUTH_REQUIRED);
  }

  if (!response.ok) {
    throw new Error("No se pudo eliminar la clave de acceso.");
  }
}
