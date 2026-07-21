import type { InstitutionPermissionGroup } from "@features/roles/types/institution-role.types";

export type PlatformRoleType = "SYSTEM" | "CUSTOM";

export type PlatformRoleInstitution = {
  id: string;
  name: string;
  active: boolean;
};

export type PlatformRoleListItem = {
  id: string;
  name: string;
  technicalCode: string | null;
  editable: boolean;
  deletable: boolean;
  assignmentCount: number;
  permissionCount: number;
  institution: PlatformRoleInstitution;
};

export type PlatformRole = Omit<PlatformRoleListItem, "permissionCount"> & {
  permissions: readonly string[];
  protectedPermissions: readonly string[];
};

export type PlatformRoleFormState = {
  error?: string;
  fieldErrors?: {
    institutionId?: string;
    name?: string;
  };
};

export type PlatformPermissionGroup = InstitutionPermissionGroup;
