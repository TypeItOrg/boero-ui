import type { EnrollmentPeriodOfferingRequest } from "@features/enrollment-periods/types/enrollment-period-offering-request.types";
export type CreateEnrollmentPeriodRequest = {
  academicYearId: string;
  offerings: EnrollmentPeriodOfferingRequest[];
  name: string;
  startDate: string;
  endDate: string;
};
