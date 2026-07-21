import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import { peopleApiFetch } from "@features/people/services/people-api-fetch.service";
import {
  FALLBACK_SYSTEM_ROLES,
  type AssignableRole,
  type SystemRoleList,
} from "@features/people/types/person-role.types";
import type { PeopleScope } from "@features/people/utils/people-scope.util";

export async function fetchSystemRoles(institutionId: string, scope: PeopleScope = "admin"): Promise<AssignableRole[]> {
  const response = await peopleApiFetch(
    scope,
    `${scope === "institutional" ? "/api/v1/institutions" : "/api/v1/admin/institutions"}/${institutionId}/roles`,
  );

  return parseHttpResponse(response, PEOPLE_ERROR_MESSAGES.FETCH_ROLES);
}

export async function fetchSystemRolesWithFallback(): Promise<SystemRoleList> {
  try {
    const response = await peopleApiFetch("admin", "/api/v1/admin/roles/system");
    return await parseHttpResponse(response, PEOPLE_ERROR_MESSAGES.FETCH_ROLES);
  } catch {
    return { roles: FALLBACK_SYSTEM_ROLES };
  }
}
