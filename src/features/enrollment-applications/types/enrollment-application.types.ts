export type EnrollmentApplicationStatus = "DRAFT" | "SUBMITTED" | "CANCELLED" | "REJECTED";

export interface EnrollmentApplicationResponse {
  applicationId: string;
  institutionId: string;
  personId: string;
  studyPlanId: string;
  academicYearId: string;
  enrollmentPeriodId: string;
  status: EnrollmentApplicationStatus;
  isEditable: boolean;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface StartEnrollmentApplicationInput {
  studyPlanId: string;
  academicYearId: string;
}

export interface UpdateEnrollmentDraftInput {
  data: Record<string, unknown>;
}
