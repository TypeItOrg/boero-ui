import { type SystemRoleCode as SystemRoleCodeType } from "@features/people/types/system-role-code.types";

export type SelectedRole = {
  roleId: string;
  technicalCode: SystemRoleCodeType | null;
  displayName: string;
  assignedAt?: string;
};
