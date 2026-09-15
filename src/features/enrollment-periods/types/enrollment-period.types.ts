import type { EnrollmentPeriodStatus } from "@features/enrollment-periods/types/enrollment-period-status.types";

export type EnrollmentPeriod = {
  id: string;
  institutionId: string;
  academicYearId: string;
  academicYearNumber: number;
  name: string;
  startDate: string;
  endDate: string;
  status: EnrollmentPeriodStatus;
  deletedAt?: string | null;
};
