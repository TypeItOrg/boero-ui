import type { PaginationParams } from "@common/types/pagination-params.types";
import type { PaginationSearchParams } from "@common/types/pagination-search-params.types";
import { PAGE_SIZE_OPTIONS, parsePaginationQuery } from "@common/utils/pagination-query.util";
import { parseSortQuery, type Sort, type SortSearchParams } from "@common/utils/sort-query.util";
import type { PersonSummary } from "@features/people/types/person-summary.types";

export const DEFAULT_TEACHERS_PAGE_SIZE = 10;
export const TEACHERS_PAGE_SIZE_OPTIONS = PAGE_SIZE_OPTIONS;
export const TEACHERS_SORT_FIELDS = ["lastName", "firstName", "documentNumber"] as const satisfies readonly (keyof PersonSummary)[];

export type TeachersSortField = (typeof TEACHERS_SORT_FIELDS)[number];
export type TeachersSort = Sort<TeachersSortField>;
export type TeachersSearchParams = PaginationSearchParams & SortSearchParams;
export type TeachersPaginationParams = PaginationParams & {
  search: string;
  sort: TeachersSort;
};

export const DEFAULT_TEACHERS_SORT = { field: "lastName", direction: "asc" } as const satisfies TeachersSort;

const teachersSortFields = new Set<TeachersSortField>(TEACHERS_SORT_FIELDS);

export function parseTeachersPaginationParams(searchParams: TeachersSearchParams): TeachersPaginationParams {
  const { page, size, search } = parsePaginationQuery(searchParams, {
    allowedPageSizes: new Set<number>(TEACHERS_PAGE_SIZE_OPTIONS),
    defaultSize: DEFAULT_TEACHERS_PAGE_SIZE,
  });

  return {
    page,
    size,
    search,
    sort: parseSortQuery(searchParams, teachersSortFields, DEFAULT_TEACHERS_SORT),
  };
}
