import type { SystemRoleCode } from "@features/people/types/system-role-code.types";

export type PersonRole = {
  roleId: string;
  technicalCode: SystemRoleCode | null;
  displayName: string;
  assignedAt: string;
  accessScope: "INSTITUTION" | "TRAINING_PATHS";
  trainingPathIds: string[];
  trainingPathNames: Record<string, string>;
};
