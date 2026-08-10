import type { PaginationParams } from "@common/types/pagination-params.types";
import type { PaginationSearchParams } from "@common/types/pagination-search-params.types";
import type { QueryParamValue } from "@common/types/query-param.types";
import { parseOptionalBooleanQueryParam } from "@common/utils/query-param.util";
import { PAGE_SIZE_OPTIONS, parsePaginationQuery } from "@common/utils/pagination-query.util";
import { parseSortQuery, type Sort, type SortSearchParams } from "@common/utils/sort-query.util";
import type { InstitutionSummary } from "@features/institutions/types/institution-summary.types";

export const DEFAULT_INSTITUTION_PAGE_SIZE = 10;
export const INSTITUTION_PAGE_SIZE_OPTIONS = PAGE_SIZE_OPTIONS;
export const INSTITUTION_SORT_FIELDS = ["name", "active"] as const satisfies readonly (keyof InstitutionSummary)[];

export type InstitutionSortField = (typeof INSTITUTION_SORT_FIELDS)[number];
export type InstitutionSort = Sort<InstitutionSortField>;

export const DEFAULT_INSTITUTION_SORT = { field: "name", direction: "asc" } as const satisfies InstitutionSort;

const institutionSortFields = new Set<InstitutionSortField>(INSTITUTION_SORT_FIELDS);

export type InstitutionSearchParams = PaginationSearchParams &
  SortSearchParams & {
    active?: QueryParamValue;
  };

export type InstitutionPaginationParams = PaginationParams & {
  active: boolean | undefined;
  search: string;
  sort: InstitutionSort;
};

export function parseInstitutionPaginationParams(searchParams: InstitutionSearchParams): InstitutionPaginationParams {
  const { page, size, search } = parsePaginationQuery(searchParams, {
    allowedPageSizes: new Set<number>(INSTITUTION_PAGE_SIZE_OPTIONS),
    defaultSize: DEFAULT_INSTITUTION_PAGE_SIZE,
  });

  return {
    page,
    size,
    search,
    active: parseOptionalBooleanQueryParam(searchParams.active),
    sort: parseSortQuery(searchParams, institutionSortFields, DEFAULT_INSTITUTION_SORT),
  };
}
