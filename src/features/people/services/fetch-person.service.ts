import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import type { Person } from "../types/person.types";
import { PEOPLE_ERROR_MESSAGES } from "../constants/error-messages.constants";

export async function fetchPerson(institutionId: string, personId: string): Promise<Person | null> {
  const response = await platformApiFetch(`/api/v1/institutions/${institutionId}/people/${personId}`);

  if (response.status === 404) return null;

  return parseHttpResponse(response, PEOPLE_ERROR_MESSAGES.FETCH_PERSON);
}
