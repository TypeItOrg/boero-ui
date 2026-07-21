import type { PaginationParams, PaginationSearchParams } from "@common/types/pagination.types";
import type { QueryParamValue } from "@common/types/query-param.types";
import { PAGE_SIZE_OPTIONS, parsePaginationQuery } from "@common/utils/pagination-query.util";
import { getQueryParamValue } from "@common/utils/query-param.util";
import { parseSortQuery, type Sort, type SortSearchParams } from "@common/utils/sort-query.util";
import { SYSTEM_ROLE_CODES, type SystemRoleCode } from "@features/people/types/person-role.types";
import type { PlatformPersonSummary } from "@features/people/types/person.types";

export const DEFAULT_PLATFORM_PEOPLE_PAGE_SIZE = 10;
export const PLATFORM_PEOPLE_PAGE_SIZE_OPTIONS = PAGE_SIZE_OPTIONS;
export const PLATFORM_PEOPLE_SORT_FIELDS = [
  "lastName",
  "documentNumber",
  "institutionName",
] as const satisfies readonly (keyof PlatformPersonSummary)[];

export type PlatformPeopleSortField = (typeof PLATFORM_PEOPLE_SORT_FIELDS)[number];
export type PlatformPeopleSort = Sort<PlatformPeopleSortField>;

export const DEFAULT_PLATFORM_PEOPLE_SORT = {
  field: "lastName",
  direction: "asc",
} as const satisfies PlatformPeopleSort;

const platformPeopleSortFields = new Set<PlatformPeopleSortField>(PLATFORM_PEOPLE_SORT_FIELDS);
const systemRoleCodes = new Set<string>(SYSTEM_ROLE_CODES);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type PlatformPeopleSearchParams = PaginationSearchParams &
  SortSearchParams & {
    institutionId?: QueryParamValue;
    roleCode?: QueryParamValue;
  };

export type PlatformPeoplePaginationParams = PaginationParams & {
  institutionId: string | undefined;
  roleCode: SystemRoleCode | undefined;
  search: string;
  sort: PlatformPeopleSort;
};

export function parsePlatformPeoplePaginationParams(
  searchParams: PlatformPeopleSearchParams,
): PlatformPeoplePaginationParams {
  const { page, size, search } = parsePaginationQuery(searchParams, {
    allowedPageSizes: new Set<number>(PLATFORM_PEOPLE_PAGE_SIZE_OPTIONS),
    defaultSize: DEFAULT_PLATFORM_PEOPLE_PAGE_SIZE,
  });

  return {
    page,
    size,
    search,
    institutionId: parseInstitutionId(searchParams.institutionId),
    roleCode: parseRoleCode(searchParams.roleCode),
    sort: parseSortQuery(searchParams, platformPeopleSortFields, DEFAULT_PLATFORM_PEOPLE_SORT),
  };
}

function parseInstitutionId(value: QueryParamValue): string | undefined {
  const institutionId = getQueryParamValue(value);
  return institutionId && UUID_PATTERN.test(institutionId) ? institutionId : undefined;
}

function parseRoleCode(value: QueryParamValue): SystemRoleCode | undefined {
  const roleCode = getQueryParamValue(value);
  return roleCode && systemRoleCodes.has(roleCode) ? (roleCode as SystemRoleCode) : undefined;
}
