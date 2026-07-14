import { createHttpError } from "@common/utils/create-http-error.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import type { Person } from "../types/person.types";

export async function fetchPerson(institutionId: string, personId: string): Promise<Person> {
  const response = await platformApiFetch(`/api/v1/institutions/${institutionId}/people/${personId}`);

  if (!response.ok) {
    throw createHttpError("No se pudo obtener el usuario", response.status);
  }

  return response.json();
}
