import type { EnrollmentPeriodOfferingRequest } from "@features/enrollment-periods/types/enrollment-period-offering-request.types";
export type UpdateEnrollmentPeriodRequest = {
  offerings: EnrollmentPeriodOfferingRequest[];
  name: string;
  startDate: string;
  endDate: string;
};
