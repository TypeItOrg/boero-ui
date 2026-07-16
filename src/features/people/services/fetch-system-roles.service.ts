import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import { FALLBACK_SYSTEM_ROLES, type SystemRoleList } from "../types/person-role.types";

export async function fetchSystemRoles(): Promise<SystemRoleList> {
  const response = await platformApiFetch("/api/v1/roles/system");

  return parseHttpResponse(response, PEOPLE_ERROR_MESSAGES.FETCH_ROLES);
}

export async function fetchSystemRolesWithFallback(): Promise<SystemRoleList> {
  try {
    return await fetchSystemRoles();
  } catch {
    return { roles: FALLBACK_SYSTEM_ROLES };
  }
}
