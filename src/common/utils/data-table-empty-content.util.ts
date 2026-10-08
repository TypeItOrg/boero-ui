import { DATA_TABLE_EMPTY_MESSAGES } from "@common/constants/data-table-empty.constants";
import type { DataTableEmptyContentOptions } from "@common/types/data-table-empty-content-options.types";

export function getDataTableEmptyContent(options: DataTableEmptyContentOptions): { title: string; description: string } {
  if (options.hasItemsOnOtherPages) {
    return { title: options.pageTitle, description: DATA_TABLE_EMPTY_MESSAGES.PAGE_DESCRIPTION };
  }

  if (options.hasFilters) {
    return {
      title: options.filteredTitle,
      description: options.filteredDescription ?? DATA_TABLE_EMPTY_MESSAGES.FILTERED_DESCRIPTION,
    };
  }

  return { title: options.emptyTitle, description: options.emptyDescription };
}
