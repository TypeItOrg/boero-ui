"use client";

import type { ReactElement } from "react";

import { AsyncDropdownItem, LoadingMoreRow } from "@common/components/ui/async-dropdown-item";
import { CommandItem } from "@common/components/ui/command";
import { DROPDOWN_GROUP_EDGE_SPACING_CLASS_NAMES, DROPDOWN_GROUP_HEADING_CLASS_NAME } from "@common/constants/dropdown-group.constants";
import { useVirtualizedDropdownItems } from "@common/hooks/use-virtualized-dropdown-items";
import type { VirtualizedDropdownItemsProps } from "@common/types/virtualized-dropdown-items-props.types";
import { cn } from "@common/utils/cn.util";

export function VirtualizedDropdownItems<TItem>({
  defaultOption,
  estimateSize,
  getItemLabel,
  getItemDisplayLabel,
  getItemDescription,
  getItemGroup,
  getItemValue,
  groupOrder,
  compareGroups,
  hasNextPage,
  isFetchingNextPage,
  items,
  listClassName,
  listHeight,
  loadNextPage,
  onSelect,
  renderItem,
  selectedValues,
  showDefaultOption,
  value,
}: VirtualizedDropdownItemsProps<TItem>): ReactElement {
  const {
    parentRef,
    rows,
    rowVirtualizer,
    virtualItems,
    virtualContentHeight,
    measuredViewportHeight,
    hasScrollableOverflow,
    rememberScrollAnchor,
    selectedValueSet,
    measureRows,
  } = useVirtualizedDropdownItems({
    defaultOption,
    estimateSize,
    getItemLabel,
    getItemDisplayLabel,
    getItemDescription,
    getItemGroup,
    getItemValue,
    groupOrder,
    compareGroups,
    hasNextPage,
    isFetchingNextPage,
    items,
    listClassName,
    listHeight,
    loadNextPage,
    onSelect,
    renderItem,
    selectedValues,
    showDefaultOption,
    value,
  });

  return (
    <div
      ref={parentRef}
      aria-busy={isFetchingNextPage}
      onScroll={rememberScrollAnchor}
      className={cn("overflow-y-auto overscroll-contain", hasScrollableOverflow && !getItemGroup && "pr-2", listClassName)}
      style={{ height: measuredViewportHeight }}
    >
      <div className="relative w-full" style={{ height: virtualContentHeight }}>
        {virtualItems.map((virtualItem) => {
          const row = rows[virtualItem.index];

          const rowStyle = {
            height: measureRows ? undefined : virtualItem.size,
            transform: `translateY(${virtualItem.start}px)`,
          };

          if (row.kind === "group") {
            return (
              <div
                key={virtualItem.key}
                ref={rowVirtualizer.measureElement}
                data-index={virtualItem.index}
                aria-hidden="true"
                className={cn("absolute top-0 left-0 w-full", DROPDOWN_GROUP_HEADING_CLASS_NAME)}
                style={rowStyle}
              >
                {row.label}
              </div>
            );
          }

          if (row.kind === "default" && defaultOption) {
            return (
              <div
                key={virtualItem.key}
                ref={measureRows ? rowVirtualizer.measureElement : undefined}
                data-index={virtualItem.index}
                className={cn("absolute top-0 left-0 w-full", getItemGroup && "px-1")}
                style={rowStyle}
              >
                <CommandItem
                  className={measureRows ? "min-h-9" : "h-full"}
                  data-checked={value === defaultOption.value}
                  onSelect={() => onSelect(undefined)}
                  value="__async-dropdown-default"
                >
                  <span className="truncate">{defaultOption.label}</span>
                </CommandItem>
              </div>
            );
          }

          if (row.kind !== "item") {
            return (
              <div
                key={virtualItem.key}
                ref={measureRows ? rowVirtualizer.measureElement : undefined}
                data-index={virtualItem.index}
                className="absolute top-0 left-0 w-full"
                style={rowStyle}
              >
                <LoadingMoreRow itemSize={estimateSize} />
              </div>
            );
          }

          return (
            <div
              key={virtualItem.key}
              ref={measureRows ? rowVirtualizer.measureElement : undefined}
              data-index={virtualItem.index}
              className={cn(
                "absolute top-0 left-0 w-full",
                getItemGroup && "px-1",
                row.isFirstInGroup && DROPDOWN_GROUP_EDGE_SPACING_CLASS_NAMES.virtual.first,
                row.isLastInGroup && DROPDOWN_GROUP_EDGE_SPACING_CLASS_NAMES.virtual.last,
              )}
              style={rowStyle}
            >
              <AsyncDropdownItem
                getItemLabel={getItemLabel}
                getItemDisplayLabel={getItemDisplayLabel}
                getItemDescription={getItemDescription}
                getItemValue={getItemValue}
                item={row.item}
                onSelect={onSelect}
                renderItem={renderItem}
                selected={selectedValueSet.has(getItemValue(row.item))}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { LoadingState } from "@common/components/ui/async-dropdown-states";

export { ErrorState } from "@common/components/ui/async-dropdown-states";

export { DropdownEmptyState } from "@common/components/ui/async-dropdown-states";
