import type { ApprovalMode } from "@features/academic/types/approval-mode.types";
import type { RequirementType } from "@features/academic/types/requirement-type.types";

export type StudyPlanSpace = {
  id: string;
  studyPlanId: string;
  academicSpaceId: string;
  academicSpaceName: string;
  academicLevelId: string | null;
  academicLevelName: string | null;
  requirementType: RequirementType;
  displayOrder: number;
  approvalMode: ApprovalMode;
};
