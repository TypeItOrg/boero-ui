import type { QueryParamValue } from "@common/types/query-param.types";

export type PaginationSearchParams = {
  page?: QueryParamValue;
  size?: QueryParamValue;
  search?: QueryParamValue;
};

export type PaginationQuery = {
  page: number;
  size: number;
  search: string;
};

export type PaginationParams = Pick<PaginationQuery, "page" | "size">;
