import type { PaginationParams } from "@common/types/pagination-params.types";

export type AsyncDropdownFetchPageInput = PaginationParams & {
  search: string;
  signal: AbortSignal;
};
