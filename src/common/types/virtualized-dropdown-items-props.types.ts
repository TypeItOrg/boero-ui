import type { ReactNode } from "react";

import type { AsyncDropdownDefaultOption } from "@common/types/async-dropdown-default-option.types";
import type { AsyncDropdownRenderItemState } from "@common/types/async-dropdown-render-item-state.types";

export type VirtualizedDropdownItemsProps<TItem> = {
  defaultOption?: AsyncDropdownDefaultOption;
  estimateSize: number;
  getItemLabel: (item: TItem) => string;
  getItemDisplayLabel?: (item: TItem) => string;
  getItemDescription?: (item: TItem) => string | undefined;
  getItemGroup?: (item: TItem) => string | undefined;
  getItemValue: (item: TItem) => string;
  groupOrder?: readonly string[];
  compareGroups?: (left: string, right: string) => number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  items: TItem[];
  listClassName?: string;
  listHeight: number;
  loadNextPage: () => void;
  onSelect: (item: TItem | undefined) => void;
  renderItem?: (item: TItem, state: AsyncDropdownRenderItemState) => ReactNode;
  selectedValues?: readonly string[];
  showDefaultOption: boolean;
  value?: string;
};
