import type { SystemRoleCode } from "@features/people/types/system-role-code.types";

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
