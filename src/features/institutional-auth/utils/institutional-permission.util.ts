import type { InstitutionalPermission } from "@features/institutional-auth/types/institutional-permission.types";
import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";

type InstitutionalPermissionSource = Pick<InstitutionalUser, "permissions"> | null | undefined;

export function hasInstitutionalPermission(user: InstitutionalPermissionSource, permission: InstitutionalPermission): boolean {
  return user?.permissions.includes(permission) ?? false;
}

export function hasAnyInstitutionalPermission(user: InstitutionalPermissionSource, permissions: readonly InstitutionalPermission[]): boolean {
  return permissions.some((permission) => hasInstitutionalPermission(user, permission));
}

export function hasAllInstitutionalPermissions(user: InstitutionalPermissionSource, permissions: readonly InstitutionalPermission[]): boolean {
  return permissions.every((permission) => hasInstitutionalPermission(user, permission));
}
