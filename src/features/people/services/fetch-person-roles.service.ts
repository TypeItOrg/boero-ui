import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import { peopleApiFetch } from "./people-api-fetch.service";
import type { PersonRole } from "../types/person-role.types";
import type { PeopleScope } from "../utils/people-scope.util";
import { getRolesPath } from "../utils/people-scope.util";

export async function fetchPersonRoles(
  institutionId: string,
  personId: string,
  scope: PeopleScope = "admin",
): Promise<PersonRole[]> {
  const response = await peopleApiFetch(scope, getRolesPath(scope, institutionId, personId));

  return parseHttpResponse(response, PEOPLE_ERROR_MESSAGES.FETCH_PERSON_ROLES);
}
