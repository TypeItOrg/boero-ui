import type { EnrollmentApplicationDraftData } from "@features/enrollment/types/enrollment-application-draft-data.types";
import type { EnrollmentApplicationStatus } from "@features/enrollment/types/enrollment-application-status.types";

export type EnrollmentApplication = {
  applicationId: string;
  personId: string;
  institutionId: string;
  studyPlanId: string;
  academicYearId: string;
  enrollmentPeriodId: string | null;
  status: EnrollmentApplicationStatus;
  isEditable: boolean;
  data: EnrollmentApplicationDraftData;
  createdAt: string;
  updatedAt: string;
};
