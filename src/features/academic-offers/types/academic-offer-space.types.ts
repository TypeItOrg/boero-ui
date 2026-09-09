import type { AcademicSpaceFormat } from "@features/academic/types/academic-space-format.types";
import type { AcademicSpaceType } from "@features/academic/types/academic-space-type.types";
import type { ApprovalMode } from "@features/academic/types/approval-mode.types";
import type { RequirementType } from "@features/academic/types/requirement-type.types";

export type AcademicOfferSpace = {
  studyPlanSpaceId: string;
  academicSpaceId: string;
  academicLevelId: string | null;
  name: string;
  description: string | null;
  type: AcademicSpaceType;
  format: AcademicSpaceFormat;
  requirementType: RequirementType;
  displayOrder: number;
  approvalMode: ApprovalMode;
};
