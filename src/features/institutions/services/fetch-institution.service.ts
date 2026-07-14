import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import type { Institution } from "../types/institution.types";
import { createHttpError } from "@common/utils/create-http-error.util";

export async function fetchInstitution(id: string): Promise<Institution> {
  const response = await platformApiFetch(`/api/v1/platform/institutions/${id}`);

  if (!response.ok) {
    throw createHttpError("No se pudo obtener la institución", response.status);
  }

  return response.json();
}
