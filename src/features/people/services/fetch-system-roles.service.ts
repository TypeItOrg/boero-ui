import { parseHttpResponse } from "@common/utils/http-response-error.util";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { PAGE_SIZE_OPTIONS } from "@common/utils/pagination-query.util";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import { peopleApiFetch } from "@features/people/services/people-api-fetch.service";
import type { AssignableRole } from "@features/people/types/assignable-role.types";
import type { SystemRoleList } from "@features/people/types/system-role-list.types";
import { PeopleScope, type PeopleScope as PeopleScopeType } from "@features/people/utils/people-scope.util";

const ROLE_CATALOG_PAGE_SIZE = PAGE_SIZE_OPTIONS[PAGE_SIZE_OPTIONS.length - 1];

export async function fetchSystemRoles(institutionId: string, scope: PeopleScopeType = PeopleScope.ADMIN): Promise<AssignableRole[]> {
  if (PeopleScope.isInstitutional(scope)) {
    const response = await peopleApiFetch(scope, `/api/v1/institutions/${institutionId}/roles?size=${ROLE_CATALOG_PAGE_SIZE}`);
    const page = await parseHttpResponse<PaginatedResponse<AssignableRole>>(response, PEOPLE_ERROR_MESSAGES.FETCH_ROLES);

    return page.items;
  }

  const response = await peopleApiFetch(scope, `/api/v1/admin/institutions/${institutionId}/roles`);

  return parseHttpResponse<AssignableRole[]>(response, PEOPLE_ERROR_MESSAGES.FETCH_ROLES);
}

export async function fetchSystemRolesCatalog(): Promise<SystemRoleList> {
  const response = await peopleApiFetch(PeopleScope.ADMIN, "/api/v1/admin/roles/system");
  return parseHttpResponse<SystemRoleList>(response, PEOPLE_ERROR_MESSAGES.FETCH_ROLES);
}
