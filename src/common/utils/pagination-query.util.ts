import type { PaginationParams } from "@common/types/pagination-params.types";
import type { PaginationQuery } from "@common/types/pagination-query.types";
import type { PaginationSearchParams } from "@common/types/pagination-search-params.types";
import type { QueryParamValue } from "@common/types/query-param.types";
import { getQueryParamValue } from "@common/utils/query-param.util";

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50] as const;
const DEFAULT_ALLOWED_PAGE_SIZES = new Set<number>(PAGE_SIZE_OPTIONS);

type ParsePaginationQueryOptions = {
  allowedPageSizes?: Set<number>;
  defaultPage?: number;
  defaultSize?: number;
};

type BuildPaginationSearchParamsInput = PaginationParams & {
  search?: string;
};

export function parsePaginationQuery(searchParams: PaginationSearchParams, options: ParsePaginationQueryOptions = {}): PaginationQuery {
  const allowedPageSizes = options.allowedPageSizes ?? DEFAULT_ALLOWED_PAGE_SIZES;
  const defaultPage = options.defaultPage ?? DEFAULT_PAGE;
  const defaultSize = options.defaultSize ?? DEFAULT_SIZE;

  return {
    page: parsePage(searchParams.page, defaultPage),
    size: parseSize(searchParams.size, allowedPageSizes, defaultSize),
    search: parseSearch(searchParams.search),
  };
}

export function buildPaginationSearchParams({ page, size, search }: BuildPaginationSearchParamsInput): URLSearchParams {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(page));
  searchParams.set("size", String(size));

  if (search?.trim()) {
    searchParams.set("search", search.trim());
  }

  return searchParams;
}

function parsePage(value: QueryParamValue, defaultPage: number): number {
  const parsed = parseInteger(value);

  if (parsed === undefined || parsed < 0) {
    return defaultPage;
  }

  return parsed;
}

function parseSize(value: QueryParamValue, allowedPageSizes: Set<number>, defaultSize: number): number {
  const parsed = parseInteger(value);

  if (parsed === undefined || !allowedPageSizes.has(parsed)) {
    return defaultSize;
  }

  return parsed;
}

function parseSearch(value: QueryParamValue): string {
  const rawValue = getQueryParamValue(value);
  return rawValue?.trim() ?? "";
}

function parseInteger(value: QueryParamValue): number | undefined {
  const rawValue = getQueryParamValue(value);
  if (!rawValue) return undefined;

  const parsed = Number(rawValue);
  if (!Number.isInteger(parsed)) return undefined;

  return parsed;
}
