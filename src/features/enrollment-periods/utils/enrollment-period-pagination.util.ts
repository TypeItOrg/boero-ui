import { isValidUuid } from "@common/utils/action-argument.util";
import { parsePaginationQuery } from "@common/utils/pagination-query.util";
import type { PaginationSearchParams } from "@common/types/pagination-search-params.types";
import { isEnrollmentPeriodStatus } from "@features/enrollment-periods/utils/enrollment-period-status.util";

export function parseEnrollmentPeriodPaginationParams(params: PaginationSearchParams & { academicYearId?: string; status?: string }) {
  return {
    ...parsePaginationQuery(params),
    academicYearId: isValidUuid(params.academicYearId) ? params.academicYearId : undefined,
    status: isEnrollmentPeriodStatus(params.status) ? params.status : undefined,
  };
}
