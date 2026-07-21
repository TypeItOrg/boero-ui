import "server-only";

import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import type { InstitutionPermissionGroup, InstitutionRole } from "@features/roles/types/institution-role.types";

const FETCH_ROLES_ERROR = "No se pudieron obtener los roles institucionales.";

export async function fetchInstitutionRoles(institutionId: string): Promise<InstitutionRole[]> {
  const response = await institutionalApiFetch(`/api/v1/institutions/${institutionId}/roles`);
  return parseHttpResponse(response, FETCH_ROLES_ERROR);
}

export async function fetchInstitutionRole(institutionId: string, roleId: string): Promise<InstitutionRole | null> {
  const response = await institutionalApiFetch(`/api/v1/institutions/${institutionId}/roles/${roleId}`);
  if (response.status === 404) return null;
  return parseHttpResponse(response, FETCH_ROLES_ERROR);
}

export async function fetchInstitutionPermissionGroups(institutionId: string): Promise<InstitutionPermissionGroup[]> {
  const response = await institutionalApiFetch(`/api/v1/institutions/${institutionId}/permissions`);
  return parseHttpResponse(response, "No se pudo obtener el catálogo de permisos.");
}
