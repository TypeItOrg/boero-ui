import type { PaginationParams, PaginationSearchParams } from "@common/types/pagination.types";
import type { QueryParamValue } from "@common/types/query-param.types";
import { PAGE_SIZE_OPTIONS, parsePaginationQuery } from "@common/utils/pagination-query.util";
import { parseOptionalBooleanQueryParam } from "@common/utils/query-param.util";
import { parseSortQuery, type Sort, type SortSearchParams } from "@common/utils/sort-query.util";
import type { PlatformAccountAdmin } from "@features/platform-accounts/types/platform-account.types";

export const DEFAULT_PLATFORM_ACCOUNT_PAGE_SIZE = 10;
export const PLATFORM_ACCOUNT_PAGE_SIZE_OPTIONS = PAGE_SIZE_OPTIONS;
export const PLATFORM_ACCOUNT_SORT_FIELDS = [
  "name",
  "email",
  "enabled",
  "createdAt",
] as const satisfies readonly (keyof PlatformAccountAdmin)[];

export type PlatformAccountSortField = (typeof PLATFORM_ACCOUNT_SORT_FIELDS)[number];
export type PlatformAccountSort = Sort<PlatformAccountSortField>;

export const DEFAULT_PLATFORM_ACCOUNT_SORT = {
  field: "name",
  direction: "asc",
} as const satisfies PlatformAccountSort;

const platformAccountSortFields = new Set<PlatformAccountSortField>(PLATFORM_ACCOUNT_SORT_FIELDS);

export type PlatformAccountSearchParams = PaginationSearchParams &
  SortSearchParams & {
    enabled?: QueryParamValue;
  };

export type PlatformAccountPaginationParams = PaginationParams & {
  enabled: boolean | undefined;
  search: string;
  sort: PlatformAccountSort;
};

export function parsePlatformAccountPaginationParams(
  searchParams: PlatformAccountSearchParams,
): PlatformAccountPaginationParams {
  const { page, size, search } = parsePaginationQuery(searchParams, {
    allowedPageSizes: new Set<number>(PLATFORM_ACCOUNT_PAGE_SIZE_OPTIONS),
    defaultSize: DEFAULT_PLATFORM_ACCOUNT_PAGE_SIZE,
  });

  return {
    page,
    size,
    search,
    enabled: parseOptionalBooleanQueryParam(searchParams.enabled),
    sort: parseSortQuery(searchParams, platformAccountSortFields, DEFAULT_PLATFORM_ACCOUNT_SORT),
  };
}
