import type { PaginationParams } from "@common/types/pagination-params.types";
import type { PaginationSearchParams } from "@common/types/pagination-search-params.types";
import type { QueryParamValue } from "@common/types/query-param.types";
import { PAGE_SIZE_OPTIONS, parsePaginationQuery } from "@common/utils/pagination-query.util";
import { getQueryParamValue, parseUuidQueryParam } from "@common/utils/query-param.util";
import { parseSortQuery, type Sort, type SortSearchParams } from "@common/utils/sort-query.util";
import { PLATFORM_ROLE_TYPE, type PlatformRoleType } from "@features/roles/types/platform-role-type.types";

export const DEFAULT_PLATFORM_ROLES_PAGE_SIZE = 10;
export const PLATFORM_ROLES_PAGE_SIZE_OPTIONS = PAGE_SIZE_OPTIONS;
export const PLATFORM_ROLES_SORT_FIELDS = ["name", "institutionName"] as const satisfies readonly ("name" | "institutionName")[];
export type PlatformRoleSortField = (typeof PLATFORM_ROLES_SORT_FIELDS)[number];
export type PlatformRoleSort = Sort<PlatformRoleSortField>;
export type PlatformRolesSearchParams = PaginationSearchParams &
  SortSearchParams & {
    institutionId?: QueryParamValue;
    roleType?: QueryParamValue;
  };
export type PlatformRolesPaginationParams = PaginationParams & {
  institutionId: string | undefined;
  roleType: PlatformRoleType | undefined;
  search: string;
  sort: PlatformRoleSort;
};

export const DEFAULT_PLATFORM_ROLES_SORT = {
  field: "name",
  direction: "asc",
} as const satisfies PlatformRoleSort;

const ROLE_TYPES = new Set<PlatformRoleType>([PLATFORM_ROLE_TYPE.SYSTEM, PLATFORM_ROLE_TYPE.CUSTOM]);
const SORT_FIELDS = new Set<PlatformRoleSortField>(PLATFORM_ROLES_SORT_FIELDS);

export function parsePlatformRolesPaginationParams(searchParams: PlatformRolesSearchParams): PlatformRolesPaginationParams {
  const { page, size, search } = parsePaginationQuery(searchParams, {
    allowedPageSizes: new Set<number>(PLATFORM_ROLES_PAGE_SIZE_OPTIONS),
    defaultSize: DEFAULT_PLATFORM_ROLES_PAGE_SIZE,
  });
  const roleType = getQueryParamValue(searchParams.roleType);

  return {
    page,
    size,
    search,
    institutionId: parseUuidQueryParam(searchParams.institutionId),
    roleType: roleType && ROLE_TYPES.has(roleType as PlatformRoleType) ? (roleType as PlatformRoleType) : undefined,
    sort: parseSortQuery(searchParams, SORT_FIELDS, DEFAULT_PLATFORM_ROLES_SORT),
  };
}
