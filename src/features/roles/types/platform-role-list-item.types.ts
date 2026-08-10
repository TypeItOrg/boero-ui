import type { PlatformRoleInstitution } from "@features/roles/types/platform-role-institution.types";

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
