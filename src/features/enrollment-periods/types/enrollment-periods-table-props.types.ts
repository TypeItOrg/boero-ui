import type { PaginatedResponse } from "@common/types/paginated-response.types";

import type { AcademicYear } from "@features/academic/types/academic-year.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { type EnrollmentPeriodStatus } from "@features/enrollment-periods/types/enrollment-period-status.types";
import type { EnrollmentPeriod } from "@features/enrollment-periods/types/enrollment-period.types";

export interface EnrollmentPeriodsTableProps {
  institutionId: string;
  data: PaginatedResponse<EnrollmentPeriod>;
  selectedAcademicYear?: AcademicYear | null;
  institutionName?: string;
  search: string;
  status?: EnrollmentPeriodStatus;
  canCreate: boolean;
  canUpdate: boolean;
  canChangeStatus: boolean;
  canDelete: boolean;
  scope?: AcademicScope;
}
