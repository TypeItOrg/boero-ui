import type { PaginationParams } from "@common/types/pagination-params.types";
import type { PaginationSearchParams } from "@common/types/pagination-search-params.types";
import { PAGE_SIZE_OPTIONS, parsePaginationQuery } from "@common/utils/pagination-query.util";
import type { EnrollmentApplicationStatus } from "../types/enrollment-application-status.types";
import { isEnrollmentApplicationStatus } from "./enrollment-application-status.util";

export const DEFAULT_ENROLLMENT_APPLICATION_PAGE_SIZE = 10;
export const ENROLLMENT_APPLICATION_PAGE_SIZE_OPTIONS = PAGE_SIZE_OPTIONS;

export type EnrollmentApplicationSearchParams = PaginationSearchParams & {
  status?: string;
  trainingPathId?: string;
  open?: string;
};

export type EnrollmentApplicationPaginationParams = PaginationParams & {
  status?: EnrollmentApplicationStatus;
  trainingPathId?: string;
  open?: boolean;
};

export function parseEnrollmentApplicationPaginationParams(searchParams: EnrollmentApplicationSearchParams): EnrollmentApplicationPaginationParams {
  const { page, size } = parsePaginationQuery(searchParams, {
    allowedPageSizes: new Set<number>(ENROLLMENT_APPLICATION_PAGE_SIZE_OPTIONS),
    defaultSize: DEFAULT_ENROLLMENT_APPLICATION_PAGE_SIZE,
  });

  return {
    page,
    size,
    status: isEnrollmentApplicationStatus(searchParams.status) ? searchParams.status : undefined,
    trainingPathId: searchParams.trainingPathId || undefined,
    open: searchParams.open === "true",
  };
}
