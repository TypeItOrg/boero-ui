import type { InstitutionPermissionGroup } from "@features/roles/types/institution-permission-group.types";
import type { InstitutionPermission } from "@features/roles/types/institution-permission.types";

export type PermissionTreeNode = {
  permission: InstitutionPermission;
  children: readonly PermissionTreeNode[];
};

export function getPermissionMap(groups: readonly InstitutionPermissionGroup[]): Map<string, InstitutionPermission> {
  return new Map(groups.flatMap((group) => group.permissions.map((permission) => [permission.code, permission])));
}

export function getPermissionTree(
  groupPermissions: readonly InstitutionPermission[],
  allPermissions: ReadonlyMap<string, InstitutionPermission>,
): PermissionTreeNode[] {
  const groupPermissionCodes = new Set(groupPermissions.map((permission) => permission.code));
  const originalOrder = new Map(groupPermissions.map((permission, index) => [permission.code, index]));
  const childrenByParentCode = new Map<string, InstitutionPermission[]>();
  const rootPermissions: InstitutionPermission[] = [];

  for (const permission of groupPermissions) {
    const parentCode = getVisibleParentCode(permission, groupPermissionCodes, allPermissions);
    if (!parentCode) {
      rootPermissions.push(permission);
      continue;
    }

    const children = childrenByParentCode.get(parentCode) ?? [];
    children.push(permission);
    childrenByParentCode.set(parentCode, children);
  }

  const sortByOriginalOrder = (left: InstitutionPermission, right: InstitutionPermission): number =>
    (originalOrder.get(left.code) ?? 0) - (originalOrder.get(right.code) ?? 0);

  function buildTree(permission: InstitutionPermission, ancestorCodes: ReadonlySet<string> = new Set()): PermissionTreeNode {
    const nextAncestorCodes = new Set(ancestorCodes).add(permission.code);
    const children = (childrenByParentCode.get(permission.code) ?? [])
      .filter((child) => !nextAncestorCodes.has(child.code))
      .sort(sortByOriginalOrder)
      .map((child) => buildTree(child, nextAncestorCodes));

    return { permission, children };
  }

  return rootPermissions.sort(sortByOriginalOrder).map((permission) => buildTree(permission));
}

function getVisibleParentCode(
  permission: InstitutionPermission,
  groupPermissionCodes: ReadonlySet<string>,
  allPermissions: ReadonlyMap<string, InstitutionPermission>,
): string | null {
  const parentCodes = permission.requiredPermissions.filter(
    (requiredCode) => groupPermissionCodes.has(requiredCode) && allPermissions.has(requiredCode),
  );

  return parentCodes.length === 1 ? parentCodes[0] : null;
}
