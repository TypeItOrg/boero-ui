import type { PaginationParams } from "@common/types/pagination-params.types";
import type { PaginationSearchParams } from "@common/types/pagination-search-params.types";
import { PAGE_SIZE_OPTIONS, parsePaginationQuery } from "@common/utils/pagination-query.util";

export const DEFAULT_SESSIONS_PAGE_SIZE = 20;
export const SESSIONS_PAGE_SIZE_OPTIONS = PAGE_SIZE_OPTIONS;

export function parseSessionsPaginationParams(searchParams: PaginationSearchParams): PaginationParams {
  const { page, size } = parsePaginationQuery(searchParams, {
    allowedPageSizes: new Set<number>(SESSIONS_PAGE_SIZE_OPTIONS),
    defaultSize: DEFAULT_SESSIONS_PAGE_SIZE,
  });

  return { page, size };
}
