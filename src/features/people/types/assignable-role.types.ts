import type { SystemRoleCode } from "@features/people/types/system-role-code.types";

export type AssignableRole = {
  id: string;
  name: string;
  supportsTrainingPathScope?: boolean;
  inactivePermissionDescriptionsWhenScoped?: readonly string[];
  technicalCode: SystemRoleCode | null;
};
