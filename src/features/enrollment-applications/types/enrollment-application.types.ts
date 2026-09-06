import type { EnrollmentApplicationStatus } from "./enrollment-application-status.types";

export type EnrollmentApplication = {
  applicationId: string;
  institutionId: string;
  personId: string;
  applicantFirstName: string;
  applicantLastName: string;
  applicantDocumentNumber: string;
  studyPlanId: string;
  studyPlanName: string;
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
