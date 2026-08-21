import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import { peopleApiFetch } from "@features/people/services/people-api-fetch.service";
import type { PersonRole } from "@features/people/types/person-role.types";
import { getRolesPath, PeopleScope, type PeopleScope as PeopleScopeType } from "@features/people/utils/people-scope.util";

export async function fetchPersonRoles(institutionId: string, personId: string, scope: PeopleScopeType = PeopleScope.ADMIN): Promise<PersonRole[]> {
  const response = await peopleApiFetch(scope, getRolesPath(scope, institutionId, personId));

  if (response.status === 404) return [];

  return parseHttpResponse(response, PEOPLE_ERROR_MESSAGES.FETCH_PERSON_ROLES);
}
