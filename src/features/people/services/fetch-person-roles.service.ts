import { createHttpError } from "@common/utils/create-http-error.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import type { PersonRole } from "../types/person-role.types";

export async function fetchPersonRoles(institutionId: string, personId: string): Promise<PersonRole[]> {
  const response = await platformApiFetch(`/api/v1/institutions/${institutionId}/people/${personId}/roles`);

  if (!response.ok) {
    throw createHttpError("No se pudieron obtener los roles del usuario", response.status);
  }

  return response.json();
}
