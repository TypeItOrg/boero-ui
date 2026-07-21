import type { InstitutionPermission, InstitutionPermissionGroup } from "@features/roles/types/institution-role.types";

export type PermissionWithDepth = {
  permission: InstitutionPermission;
  depth: number;
};

export function getPermissionMap(groups: readonly InstitutionPermissionGroup[]): Map<string, InstitutionPermission> {
  return new Map(groups.flatMap((group) => group.permissions.map((permission) => [permission.code, permission])));
}

export function getPermissionRows(
  groupPermissions: readonly InstitutionPermission[],
  allPermissions: ReadonlyMap<string, InstitutionPermission>,
): PermissionWithDepth[] {
  const groupPermissionCodes = new Set(groupPermissions.map((permission) => permission.code));
  const originalOrder = new Map(groupPermissions.map((permission, index) => [permission.code, index]));

  return groupPermissions
    .map((permission) => ({
      permission,
      depth: getPermissionDepth(permission.code, groupPermissionCodes, allPermissions),
    }))
    .sort(
      (left, right) =>
        left.depth - right.depth ||
        (originalOrder.get(left.permission.code) ?? 0) - (originalOrder.get(right.permission.code) ?? 0),
    );
}

export function getPermissionIndentClass(depth: number): string {
  if (depth === 1) return "ml-6";
  if (depth === 2) return "ml-12";
  return depth > 2 ? "ml-18" : "ml-0";
}

function getPermissionDepth(
  code: string,
  groupPermissionCodes: ReadonlySet<string>,
  allPermissions: ReadonlyMap<string, InstitutionPermission>,
  visitedCodes: ReadonlySet<string> = new Set(),
): number {
  const permission = allPermissions.get(code);
  if (!permission || visitedCodes.has(code)) return 0;

  const nextVisitedCodes = new Set(visitedCodes).add(code);
  const parentDepths = permission.requiredPermissions
    .filter((requiredCode) => groupPermissionCodes.has(requiredCode))
    .map(
      (requiredCode) => 1 + getPermissionDepth(requiredCode, groupPermissionCodes, allPermissions, nextVisitedCodes),
    );

  return Math.max(0, ...parentDepths);
}
