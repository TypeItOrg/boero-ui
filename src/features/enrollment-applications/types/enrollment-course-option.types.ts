import type { ApprovalMode } from "@features/academic/types/approval-mode.types";
import type { RequirementType } from "@features/academic/types/requirement-type.types";

export interface EnrollmentCourseOption {
  courseId: string;
  studyPlanSpaceId: string;
  academicSpaceName: string;
  academicLevelName?: string | null;
  studyPlanName: string;
  trainingPathName: string;
  format: "INDIVIDUAL" | "GRUPAL";
  instrumentId?: string | null;
  instrumentName?: string | null;
  requirementType?: RequirementType | null;
  approvalMode?: ApprovalMode | null;
  instrumental?: boolean;
  hasCapacity: boolean;
}

export interface EnrollmentCourseGroupSelection {
  studyPlanSpaceId: string;
  courseId: string | null;
}
