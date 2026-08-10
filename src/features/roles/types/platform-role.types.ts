import type { PlatformRoleListItem } from "@features/roles/types/platform-role-list-item.types";

export type PlatformRole = Omit<PlatformRoleListItem, "permissionCount"> & {
  permissions: readonly string[];
  protectedPermissions: readonly string[];
};
