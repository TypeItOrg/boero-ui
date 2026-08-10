import type { ContextualSearchResult } from "@features/contextual-search/types/contextual-search-result.types";

export type ContextualSearchPage = {
  items: ContextualSearchResult[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};
