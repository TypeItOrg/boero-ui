import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import type { PersonRole } from "../types/person-role.types";

export async function fetchPersonRoles(institutionId: string, personId: string): Promise<PersonRole[]> {
  const response = await platformApiFetch(`/api/v1/admin/institutions/${institutionId}/people/${personId}/roles`);

  return parseHttpResponse(response, PEOPLE_ERROR_MESSAGES.FETCH_PERSON_ROLES);
}
