import type { EnrollmentApplicationStatus } from "@features/enrollment-applications/types/enrollment-application-status.types";
import type { EnrollmentApplicationData } from "@features/enrollment-applications/types/enrollment-application-data.types";

export type EnrollmentApplication = {
  applicationId: string;
  institutionId: string;
  personId: string;
  applicantFirstName: string;
  applicantLastName: string;
  applicantDocumentNumber: string;
  studyPlanId?: string | null;
  studyPlanName?: string | null;
  trainingPathId?: string | null;
  trainingPathName?: string | null;
  data?: Pick<EnrollmentApplicationData, "careerSelection">;
  academicYearId: string;
  academicYear: number;
  enrollmentPeriodId: string;
  status: EnrollmentApplicationStatus;
  isEditable: boolean;
  secondarySchool?: string | null;
  rejectionReason?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};
