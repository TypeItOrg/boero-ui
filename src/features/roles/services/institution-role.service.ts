import "server-only";

import { parseHttpResponse, parseNullableHttpResponse } from "@common/utils/http-response-error.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import type { InstitutionPermissionGroup } from "@features/roles/types/institution-permission-group.types";
import type { InstitutionRole } from "@features/roles/types/institution-role.types";
import type { InstitutionRolePage } from "@features/roles/types/institution-role-page.types";

const FETCH_ROLES_ERROR = "No se pudieron obtener los roles institucionales.";

export async function fetchInstitutionRoles(
  institutionId: string,
  params: { page: number; size: number; search: string },
): Promise<InstitutionRolePage> {
  const query = new URLSearchParams({ page: String(params.page), size: String(params.size), sort: "name,asc" });
  if (params.search) query.set("search", params.search);
  const response = await institutionalApiFetch(`/api/v1/institutions/${institutionId}/roles?${query}`);
  return parseHttpResponse(response, FETCH_ROLES_ERROR);
}

export async function fetchInstitutionRole(institutionId: string, roleId: string): Promise<InstitutionRole | null> {
  const response = await institutionalApiFetch(`/api/v1/institutions/${institutionId}/roles/${roleId}`);
  return parseNullableHttpResponse(response, FETCH_ROLES_ERROR);
}

export async function fetchInstitutionPermissionGroups(institutionId: string): Promise<InstitutionPermissionGroup[]> {
  const response = await institutionalApiFetch(`/api/v1/institutions/${institutionId}/permissions`);
  return parseHttpResponse(response, "No se pudo obtener el catálogo de permisos.");
}
