"use client";

import type { ReactElement, ReactNode } from "react";

import { LoadingSkeletonRow } from "@common/components/ui/async-dropdown-states";
import { CommandItem } from "@common/components/ui/command";
import { DropdownOptionContent } from "@common/components/ui/dropdown-option-content";
import type { AsyncDropdownRenderItemState } from "@common/types/async-dropdown-render-item-state.types";

export function AsyncDropdownItem<TItem>({
  getItemLabel,
  getItemDisplayLabel,
  getItemDescription,
  getItemValue,
  item,
  onSelect,
  renderItem,
  selected,
}: AsyncDropdownItemProps<TItem>): ReactElement {
  function renderContent(): ReactNode {
    if (renderItem) {
      return renderItem(item, { selected });
    }

    if (getItemDisplayLabel || getItemDescription) {
      return <DropdownOptionContent label={getItemDisplayLabel?.(item) ?? getItemLabel(item)} description={getItemDescription?.(item)} />;
    }

    return <span className="truncate">{getItemLabel(item)}</span>;
  }

  return (
    <CommandItem
      aria-label={getItemLabel(item)}
      className={getItemDisplayLabel || getItemDescription ? "min-h-9" : "h-full"}
      data-checked={selected}
      onSelect={() => onSelect(item)}
      value={getItemValue(item)}
    >
      {renderContent()}
    </CommandItem>
  );
}

export type AsyncDropdownItemProps<TItem> = {
  getItemDisplayLabel?: (item: TItem) => string;
  getItemDescription?: (item: TItem) => string | undefined;
  getItemLabel: (item: TItem) => string;
  getItemValue: (item: TItem) => string;
  item: TItem;
  onSelect: (item: TItem) => void;
  renderItem?: (item: TItem, state: AsyncDropdownRenderItemState) => ReactNode;
  selected: boolean;
};

export function LoadingMoreRow({ itemSize }: { itemSize: number }): ReactElement {
  return <LoadingSkeletonRow itemSize={itemSize} />;
}
