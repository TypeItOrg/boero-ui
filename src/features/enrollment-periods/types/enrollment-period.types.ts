import type { EnrollmentPeriodOffering } from "@features/enrollment-periods/types/enrollment-period-offering.types";
import type { EnrollmentPeriodStatus } from "@features/enrollment-periods/types/enrollment-period-status.types";

export type EnrollmentPeriod = {
  limitedView: boolean;
  canUpdate: boolean;
  canChangeStatus: boolean;
  canDelete: boolean;
  scopeConfigured: boolean;
  offerings: EnrollmentPeriodOffering[];
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
