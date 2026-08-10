import type { QueryParamValue } from "@common/types/query-param.types";

export type PaginationSearchParams = {
  page?: QueryParamValue;
  size?: QueryParamValue;
  search?: QueryParamValue;
};
