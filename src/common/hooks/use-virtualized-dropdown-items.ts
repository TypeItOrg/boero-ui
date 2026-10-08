"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";

import { DROPDOWN_GROUP_HEADING_ESTIMATE_SIZE } from "@common/constants/dropdown-group.constants";
import type { AsyncDropdownRow } from "@common/types/async-dropdown-row.types";
import type { VirtualizedDropdownItemsProps } from "@common/types/virtualized-dropdown-items-props.types";
import { groupDropdownItems } from "@common/utils/dropdown-groups.util";

export function useVirtualizedDropdownItems<TItem>({
  defaultOption,
  estimateSize,
  getItemDisplayLabel,
  getItemDescription,
  getItemGroup,
  getItemValue,
  groupOrder,
  compareGroups,
  hasNextPage,
  isFetchingNextPage,
  items,
  listHeight,
  loadNextPage,
  selectedValues,
  showDefaultOption,
  value,
}: VirtualizedDropdownItemsProps<TItem>) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const hasDefault = defaultOption !== undefined && showDefaultOption;
  const selectedValueSet = useMemo(() => new Set(selectedValues ?? (value ? [value] : [])), [selectedValues, value]);

  const rows = useMemo(() => {
    const result: AsyncDropdownRow<TItem>[] = [];

    if (hasDefault) {
      result.push({ kind: "default", key: "__async-dropdown-default" });
    }

    for (const group of groupDropdownItems(items, getItemGroup, groupOrder, compareGroups)) {
      if (group.label !== undefined) {
        result.push({ kind: "group", key: `group:${group.label}`, label: group.label });
      }

      for (const [index, item] of group.items.entries()) {
        result.push({
          kind: "item",
          key: `item:${getItemValue(item)}`,
          item,
          isFirstInGroup: group.label !== undefined && index === 0,
          isLastInGroup: group.label !== undefined && index === group.items.length - 1,
        });
      }
    }

    if (hasNextPage) {
      result.push({ kind: "loader", key: "__async-dropdown-loader" });
    }

    return result;
  }, [compareGroups, getItemGroup, getItemValue, groupOrder, hasDefault, hasNextPage, items]);

  const measureRows = getItemGroup !== undefined || getItemDisplayLabel !== undefined || getItemDescription !== undefined;
  const scrollAnchor = useRef<{ key: string; offset: number } | null>(null);
  const virtualCount = rows.length;

  const viewportHeight = getViewportHeight({
    itemCount: virtualCount,
    itemSize: estimateSize,
    maxHeight: listHeight,
  });

  // TanStack Virtual intentionally returns non-memoizable functions.
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: virtualCount,
    estimateSize: (index) => (rows[index].kind === "group" ? DROPDOWN_GROUP_HEADING_ESTIMATE_SIZE : estimateSize),
    getItemKey: (index) => rows[index].key,
    getScrollElement: () => parentRef.current,
    initialRect: {
      height: viewportHeight,
      width: 0,
    },
    overscan: 6,
    useFlushSync: false,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const virtualContentHeight = rowVirtualizer.getTotalSize();
  const measuredViewportHeight = measureRows ? Math.min(listHeight, Math.max(estimateSize, virtualContentHeight)) : viewportHeight;
  const hasScrollableOverflow = virtualContentHeight > measuredViewportHeight;
  const lastVirtualIndex = virtualItems.at(-1)?.index;

  useEffect(() => {
    rowVirtualizer.scrollToOffset(0);
    rowVirtualizer.measure();
  }, [rowVirtualizer]);

  useEffect(() => {
    if (lastVirtualIndex === undefined || !hasNextPage || isFetchingNextPage) {
      return;
    }

    if (lastVirtualIndex >= rows.length - 2) {
      loadNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, lastVirtualIndex, loadNextPage, rows.length]);

  useLayoutEffect(() => {
    const anchor = scrollAnchor.current;

    if (!getItemGroup || !anchor) {
      return;
    }

    const index = rows.findIndex((row) => row.key === anchor.key);
    const position = index >= 0 ? rowVirtualizer.getOffsetForIndex(index, "start") : undefined;

    if (position) {
      rowVirtualizer.scrollToOffset(position[0] - anchor.offset);
    }
  }, [getItemGroup, rows, rowVirtualizer]);

  function rememberScrollAnchor(): void {
    if (!getItemGroup || !parentRef.current) {
      return;
    }

    const scrollTop = parentRef.current.scrollTop;
    const firstItem = rowVirtualizer.getVirtualItems().find((row) => row.end > scrollTop && rows[row.index].kind === "item");

    if (firstItem) {
      scrollAnchor.current = {
        key: rows[firstItem.index].key,
        offset: firstItem.start - scrollTop,
      };
    }
  }

  return {
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
  };
}

function getViewportHeight({ itemCount, itemSize, maxHeight }: { itemCount: number; itemSize: number; maxHeight: number }): number {
  if (itemCount === 0) {
    return itemSize;
  }

  return Math.min(maxHeight, Math.max(itemSize, itemCount * itemSize));
}
