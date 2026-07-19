import type { SystemRoleCode } from "@features/people/types/person-role.types";

export type InstitutionRole = {
  id: string;
  name: string;
  technicalCode: SystemRoleCode | null;
  editable: boolean;
  deletable: boolean;
  assignmentCount: number;
  permissions: readonly string[];
  protectedPermissions: readonly string[];
};

export type InstitutionPermission = {
  code: string;
  description: string;
  grantable: boolean;
};

export type InstitutionPermissionGroup = {
  code: string;
  displayName: string;
  description: string;
  permissions: readonly InstitutionPermission[];
};

export type RoleFormState = {
  error?: string;
  fieldErrors?: { name?: string };
};
