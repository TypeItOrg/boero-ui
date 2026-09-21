import type { EnrollmentPeriod } from "@features/enrollment-periods/types/enrollment-period.types";
import type { EnrollmentApplicationStatus } from "@features/enrollment-applications/types/enrollment-application-status.types";
import type { EnrollmentApplicationSpaceResponse } from "@features/enrollment-applications/types/enrollment-application-space-response.types";
import type { EnrollmentApplicationData } from "@features/enrollment-applications/types/enrollment-application-data.types";
import type { EnrollmentApplicationCourse } from "@features/enrollment-applications/types/enrollment-application-course.types";

export interface EnrollmentApplicationResponse {
  applicationId: string;
  institutionId: string;
  personId: string;
  trainingPathId?: string | null;
  studyPlanId?: string | null;
  academicYearId: string;
  enrollmentPeriodId: string;
  enrollmentPeriod?: EnrollmentPeriod;
  periodOpen?: boolean;
  studyPlanName?: string;
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
