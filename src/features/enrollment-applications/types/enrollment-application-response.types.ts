import type { EnrollmentApplicationCourse } from "@features/enrollment-applications/types/enrollment-application-course.types";
import type { EnrollmentApplicationData } from "@features/enrollment-applications/types/enrollment-application-data.types";
import type { EnrollmentApplicationSpaceResponse } from "@features/enrollment-applications/types/enrollment-application-space-response.types";
import type { EnrollmentApplicationStatus } from "@features/enrollment-applications/types/enrollment-application-status.types";
import type { EnrollmentPeriod } from "@features/enrollment-periods/types/enrollment-period.types";

export interface EnrollmentApplicationResponse {
  applicationId: string;
  institutionId: string;
  personId: string;
  /** Person who submitted it: the tutor when the application was made on behalf of a dependent. */
  submittedByPersonId?: string | null;
  trainingPathId?: string | null;
  studyPlanId?: string | null;
  academicYearId: string;
  enrollmentPeriodId: string;
  enrollmentPeriod?: EnrollmentPeriod;
  periodOpen?: boolean;
  canReadAttachments?: boolean;
  canRequestDocuments?: boolean;
  documentRequests?: import("@features/enrollment-applications/types/enrollment-document-request.types").EnrollmentDocumentRequest[];
  documents?: import("@features/enrollment-applications/types/document-requirement.types").DocumentRequirement[];
  canApproveProvisionally?: boolean;
  canConfirm?: boolean;
  admissionHistory?: Array<{
    id: string;
    status: string;
    occurredAt: string;
    actorId: string | null;
    accountType: string;
  }>;
  studyPlanName?: string;
  studyPlanVersion?: number | null;
  trainingPathName?: string | null;
  academicYearName?: string;
  enrollmentPeriodName?: string;
  status: EnrollmentApplicationStatus;
  isEditable: boolean;
  data: EnrollmentApplicationData;
  spaces?: EnrollmentApplicationSpaceResponse[];
  courses?: EnrollmentApplicationCourse[];
  applicantName?: string;
  applicantDocumentNumber?: string;
  secondarySchool?: string | null;
  rejectionReason?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}
