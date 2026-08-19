import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { ApprovalMode } from "@features/academic/types/approval-mode.types";
import type { RequirementType } from "@features/academic/types/requirement-type.types";
import type { StudyPlanStatus } from "@features/academic/types/study-plan-status.types";

export type AcademicSpaceUsage = {
  summary: {
    totalPlans: number;
    activePlans: number;
    draftPlans: number;
    inactivePlans: number;
    totalPlacements: number;
    unassignedPlacements: number;
    deactivationBlocked: boolean;
  };
  plans: PaginatedResponse<{
    studyPlanId: string;
    name: string;
    trainingPathName: string;
    effectiveFrom: string | null;
    effectiveTo: string | null;
    status: StudyPlanStatus;
    placements: {
      studyPlanSpaceId: string;
      academicLevelId: string | null;
      academicLevelName: string | null;
      requirementType: RequirementType;
      approvalMode: ApprovalMode;
      displayOrder: number;
    }[];
  }>;
  warnings: {
    code: "USED_IN_ACTIVE_OR_DRAFT_PLAN";
    blockingPlanCount: number;
  }[];
};
