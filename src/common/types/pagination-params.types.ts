import type { PaginationQuery } from "@common/types/pagination-query.types";

export type PaginationParams = Pick<PaginationQuery, "page" | "size">;
