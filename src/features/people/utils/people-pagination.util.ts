import type { PaginationParams } from "@common/types/pagination-params.types";
import type { PaginationSearchParams } from "@common/types/pagination-search-params.types";
import { PAGE_SIZE_OPTIONS, parsePaginationQuery } from "@common/utils/pagination-query.util";
import { parseSortQuery, type Sort, type SortSearchParams } from "@common/utils/sort-query.util";
import type { PersonSummary } from "@features/people/types/person-summary.types";

export const DEFAULT_PEOPLE_PAGE_SIZE = 10;
export const PEOPLE_PAGE_SIZE_OPTIONS = PAGE_SIZE_OPTIONS;
export const PEOPLE_SORT_FIELDS = ["lastName", "firstName", "documentNumber"] as const satisfies readonly (keyof PersonSummary)[];

export type PeopleSortField = (typeof PEOPLE_SORT_FIELDS)[number];
export type PeopleSort = Sort<PeopleSortField>;

export const DEFAULT_PEOPLE_SORT = { field: "lastName", direction: "asc" } as const satisfies PeopleSort;

const peopleSortFields = new Set<PeopleSortField>(PEOPLE_SORT_FIELDS);

export type PeopleSearchParams = PaginationSearchParams &
  SortSearchParams & {
    roleId?: string;
  };

export type PeoplePaginationParams = PaginationParams & {
  search: string;
  sort: PeopleSort;
  roleId?: string;
};

export function parsePeoplePaginationParams(searchParams: PeopleSearchParams): PeoplePaginationParams {
  const { page, size, search } = parsePaginationQuery(searchParams, {
    allowedPageSizes: new Set<number>(PEOPLE_PAGE_SIZE_OPTIONS),
    defaultSize: DEFAULT_PEOPLE_PAGE_SIZE,
  });

  return {
    page,
    size,
    search,
    roleId: searchParams.roleId || undefined,
    sort: parseSortQuery(searchParams, peopleSortFields, DEFAULT_PEOPLE_SORT),
  };
}
