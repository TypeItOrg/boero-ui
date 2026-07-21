import "server-only";

import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { buildPaginationSearchParams } from "@common/utils/pagination-query.util";
import { serializeSpringSort } from "@common/utils/sort-query.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import type { InstitutionPermission, InstitutionPermissionGroup } from "@features/roles/types/institution-role.types";
import type { PlatformRole, PlatformRoleListItem } from "@features/roles/types/platform-role.types";
import type { PlatformRolesPaginationParams } from "@features/roles/utils/platform-role-pagination.util";

const ROLES_ERROR = "No se pudieron obtener los roles.";

export async function fetchPlatformRoles(
  params: PlatformRolesPaginationParams,
): Promise<PaginatedResponse<PlatformRoleListItem>> {
  const query = buildPaginationSearchParams(params);
  query.set("sort", serializeSpringSort(params.sort));
  if (params.institutionId) query.set("institutionId", params.institutionId);
  if (params.roleType) query.set("system", String(params.roleType === "SYSTEM"));

  const response = await platformApiFetch(`/api/v1/admin/roles?${query.toString()}`);
  return parseHttpResponse(response, ROLES_ERROR);
}

export async function fetchPlatformRole(roleId: string): Promise<PlatformRole | null> {
  const response = await platformApiFetch(`/api/v1/admin/roles/${roleId}`);
  if (!response.ok) return null;
  return parseHttpResponse(response, ROLES_ERROR);
}

export async function fetchPlatformPermissionGroups(): Promise<InstitutionPermissionGroup[]> {
  const response = await platformApiFetch("/api/v1/admin/permissions");
  const catalog = await parseHttpResponse<PlatformPermissionCatalogItem[]>(
    response,
    "No se pudo obtener el catálogo de permisos.",
  );
  const groups = new Map<string, MutablePermissionGroup>();
  for (const permission of catalog) {
    const group = groups.get(permission.group);
    const item: InstitutionPermission = {
      code: permission.code,
      description: permission.description,
      grantable: permission.configurable,
      requiredPermissions: permission.requiredPermissions,
    };
    if (group) {
      group.permissions = [...group.permissions, item];
      continue;
    }
    groups.set(permission.group, {
      code: permission.group,
      displayName: permission.groupDisplayName,
      description: permission.groupDescription,
      permissions: [item],
    });
  }
  return [...groups.values()];
}

type MutablePermissionGroup = {
  code: string;
  displayName: string;
  description: string;
  permissions: InstitutionPermission[];
};

type PlatformPermissionCatalogItem = {
  code: string;
  description: string;
  group: string;
  groupDisplayName: string;
  groupDescription: string;
  configurable: boolean;
  requiredPermissions: readonly string[];
};
