import { createHttpError } from "@common/utils/create-http-error.util";
import type { PlatformAccountAdmin } from "@features/platform-accounts/types/platform-account.types";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

export async function fetchPlatformAccountAdmin(id: string): Promise<PlatformAccountAdmin> {
  const response = await platformApiFetch(`/api/v1/platform/accounts/${id}`);
  if (!response.ok) {
    throw createHttpError("No se pudo obtener el administrador", response.status);
  }

  return response.json();
}
