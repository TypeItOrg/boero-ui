import type { AcademicEligibility } from "@features/enrollment-applications/types/academic-eligibility.types";
import type { ApprovalMode } from "@features/academic/types/approval-mode.types";
import type { RequirementType } from "@features/academic/types/requirement-type.types";

export interface EnrollmentCourseOption {
  academicYear: number;
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
  eligibility: AcademicEligibility;
}
