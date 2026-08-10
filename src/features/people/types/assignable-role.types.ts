import type { SystemRoleCode } from "@features/people/types/system-role-code.types";

export type AssignableRole = {
  id: string;
  name: string;
  technicalCode: SystemRoleCode | null;
};
