import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import { peopleApiFetch } from "@features/people/services/people-api-fetch.service";
import type { AssignableRole, SystemRoleList } from "@features/people/types/person-role.types";
import { PeopleScope, type PeopleScope as PeopleScopeType } from "@features/people/utils/people-scope.util";

export async function fetchSystemRoles(
  institutionId: string,
  scope: PeopleScopeType = PeopleScope.ADMIN,
): Promise<AssignableRole[]> {
  const response = await peopleApiFetch(
    scope,
    `${PeopleScope.isInstitutional(scope) ? "/api/v1/institutions" : "/api/v1/admin/institutions"}/${institutionId}/roles`,
  );

  return parseHttpResponse(response, PEOPLE_ERROR_MESSAGES.FETCH_ROLES);
}

export async function fetchSystemRolesCatalog(): Promise<SystemRoleList> {
  const response = await peopleApiFetch(PeopleScope.ADMIN, "/api/v1/admin/roles/system");
  return parseHttpResponse(response, PEOPLE_ERROR_MESSAGES.FETCH_ROLES);
}
