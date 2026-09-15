import type { EnrollmentApplicationStatus } from "@features/enrollment-applications/types/enrollment-application-status.types";

export interface FetchEnrollmentApplicationsParams {
  periodId?: string;
  status?: EnrollmentApplicationStatus | string;
  search?: string;
  page?: number;
  size?: number;
}
