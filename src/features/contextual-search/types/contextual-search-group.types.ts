import type { ContextualSearchEntity } from "@features/contextual-search/types/contextual-search-entity.types";
import type { ContextualSearchResult } from "@features/contextual-search/types/contextual-search-result.types";

export type ContextualSearchGroup = {
  entityType: ContextualSearchEntity;
  items: ContextualSearchResult[];
  hasMore: boolean;
};
