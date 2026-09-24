import type { EnrollmentApplicationStatus } from "@features/enrollment-applications/types/enrollment-application-status.types";
import type { EnrollmentApplicationSpaceResponse } from "@features/enrollment-applications/types/enrollment-application-space-response.types";
import type { EnrollmentApplicationData } from "@features/enrollment-applications/types/enrollment-application-data.types";

export interface EnrollmentApplicationResponse {
  applicationId: string;
  institutionId: string;
  personId: string;
  /** Person who submitted it: the tutor when the application was made on behalf of a dependent. */
  submittedByPersonId?: string | null;
  studyPlanId: string;
  academicYearId: string;
  enrollmentPeriodId: string;
  studyPlanName?: string;
  trainingPathName?: string | null;
  academicYearName?: string;
  enrollmentPeriodName?: string;
  status: EnrollmentApplicationStatus;
  isEditable: boolean;
  data: EnrollmentApplicationData;
  spaces?: EnrollmentApplicationSpaceResponse[];
  applicantName?: string;
  applicantDocumentNumber?: string;
  secondarySchool?: string | null;
  rejectionReason?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}
