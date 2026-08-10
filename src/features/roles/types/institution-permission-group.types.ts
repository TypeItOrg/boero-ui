import type { InstitutionPermission } from "@features/roles/types/institution-permission.types";

export type InstitutionPermissionGroup = {
  code: string;
  displayName: string;
  description: string;
  permissions: readonly InstitutionPermission[];
};
