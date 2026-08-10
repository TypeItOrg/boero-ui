import type { AsyncDropdownPage } from "@common/types/async-dropdown-page.types";
import type { PaginatedResponse } from "@common/types/paginated-response.types";

export function toAsyncDropdownPage<TItem>(data: PaginatedResponse<TItem>): AsyncDropdownPage<TItem> {
  const nextPage = data.page + 1 < data.totalPages ? data.page + 1 : null;

  return {
    items: data.items,
    nextPage,
  };
}
