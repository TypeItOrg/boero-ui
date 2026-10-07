"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CircleAlertIcon, RefreshCwIcon, SearchIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { CommandItem } from "@common/components/ui/command";
import { DropdownOptionContent } from "@common/components/ui/dropdown-option-content";
import {
  DROPDOWN_GROUP_EDGE_SPACING_CLASS_NAMES,
  DROPDOWN_GROUP_HEADING_CLASS_NAME,
  DROPDOWN_GROUP_HEADING_ESTIMATE_SIZE,
} from "@common/constants/dropdown-group.constants";
import { Skeleton } from "@common/components/ui/skeleton";
import type { AsyncDropdownDefaultOption } from "@common/types/async-dropdown-default-option.types";
import type { AsyncDropdownRenderItemState } from "@common/types/async-dropdown-render-item-state.types";
import type { AsyncDropdownRow } from "@common/types/async-dropdown-row.types";
import { groupDropdownItems } from "@common/utils/dropdown-groups.util";
import { cn } from "@common/utils/cn.util";

type AsyncDropdownItemProps<TItem> = {
  getItemDisplayLabel?: (item: TItem) => string;
  getItemDescription?: (item: TItem) => string | undefined;
  getItemLabel: (item: TItem) => string;
  getItemValue: (item: TItem) => string;
  item: TItem;
  onSelect: (item: TItem) => void;
  renderItem?: (item: TItem, state: AsyncDropdownRenderItemState) => React.ReactNode;
  selected: boolean;
};

type VirtualizedDropdownItemsProps<TItem> = {
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
  renderItem?: (item: TItem, state: AsyncDropdownRenderItemState) => React.ReactNode;
  selectedValues?: readonly string[];
  showDefaultOption: boolean;
  value?: string;
};

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
}: VirtualizedDropdownItemsProps<TItem>): React.ReactElement {
  const parentRef = React.useRef<HTMLDivElement | null>(null);
  const hasDefault = defaultOption !== undefined && showDefaultOption;
  const selectedValueSet = React.useMemo(() => new Set(selectedValues ?? (value ? [value] : [])), [selectedValues, value]);
  const rows = React.useMemo(() => {
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
  const scrollAnchor = React.useRef<{ key: string; offset: number } | null>(null);
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

  React.useEffect(() => {
    rowVirtualizer.scrollToOffset(0);
    rowVirtualizer.measure();
  }, [rowVirtualizer]);

  React.useEffect(() => {
    if (lastVirtualIndex === undefined || !hasNextPage || isFetchingNextPage) {
      return;
    }

    if (lastVirtualIndex >= rows.length - 2) {
      loadNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, lastVirtualIndex, loadNextPage, rows.length]);

  React.useLayoutEffect(() => {
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
      scrollAnchor.current = { key: rows[firstItem.index].key, offset: firstItem.start - scrollTop };
    }
  }

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

export function LoadingState({ itemSize }: { itemSize: number }): React.ReactElement {
  return (
    <div className="flex w-full flex-col gap-1 p-1">
      <LoadingInitialRow itemSize={itemSize} className="mt-1" />
    </div>
  );
}

export function ErrorState({ message, retry }: { message: string; retry: () => void }): React.ReactElement {
  return (
    <div className="p-2" role="alert">
      <div className="bg-muted/50 flex min-h-32 flex-col items-center justify-center gap-3 rounded-lg border px-4 py-5 text-center">
        <div className="bg-destructive/10 text-destructive flex size-9 items-center justify-center rounded-full">
          <CircleAlertIcon className="size-4" />
        </div>
        <p className="text-muted-foreground text-sm">{message}</p>
        <Button onClick={retry} size="sm" type="button" variant="outline">
          <RefreshCwIcon data-icon="inline-start" />
          Reintentar
        </Button>
      </div>
    </div>
  );
}

export function DropdownEmptyState({
  icon: Icon,
  title,
}: {
  description?: string;
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  title: string;
}): React.ReactElement {
  let iconElement: React.ReactNode = null;

  if (React.isValidElement(Icon)) {
    iconElement = Icon;
  } else if (typeof Icon === "function") {
    const IconComponent = Icon;
    iconElement = <IconComponent className="size-4.5" aria-hidden="true" />;
  } else {
    iconElement = <SearchIcon className="size-4.5" aria-hidden="true" />;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
      <div className="bg-background border-border/60 text-muted-foreground flex size-9 items-center justify-center rounded-full border shadow-xs">
        {iconElement}
      </div>
      <p className="text-foreground text-sm font-medium">{title}</p>
    </div>
  );
}

function AsyncDropdownItem<TItem>({
  getItemLabel,
  getItemDisplayLabel,
  getItemDescription,
  getItemValue,
  item,
  onSelect,
  renderItem,
  selected,
}: AsyncDropdownItemProps<TItem>): React.ReactElement {
  return (
    <CommandItem
      aria-label={getItemLabel(item)}
      className={getItemDisplayLabel || getItemDescription ? "min-h-9" : "h-full"}
      data-checked={selected}
      onSelect={() => onSelect(item)}
      value={getItemValue(item)}
    >
      {renderItem ? (
        renderItem(item, { selected })
      ) : getItemDisplayLabel || getItemDescription ? (
        <DropdownOptionContent label={getItemDisplayLabel?.(item) ?? getItemLabel(item)} description={getItemDescription?.(item)} />
      ) : (
        <span className="truncate">{getItemLabel(item)}</span>
      )}
    </CommandItem>
  );
}

function LoadingMoreRow({ itemSize }: { itemSize: number }): React.ReactElement {
  return <LoadingSkeletonRow itemSize={itemSize} />;
}

function LoadingInitialRow({ className, itemSize }: { className?: string; itemSize: number }): React.ReactElement {
  return (
    <div className={cn("flex w-full items-center", className)} style={{ height: itemSize }}>
      <Skeleton className="h-full w-full" />
    </div>
  );
}

function LoadingSkeletonRow({ itemSize }: { itemSize: number }): React.ReactElement {
  return (
    <div className="flex w-full items-center px-2" style={{ height: itemSize }}>
      <Skeleton className="h-full w-full" />
    </div>
  );
}

function getViewportHeight({ itemCount, itemSize, maxHeight }: { itemCount: number; itemSize: number; maxHeight: number }): number {
  if (itemCount === 0) return itemSize;
  return Math.min(maxHeight, Math.max(itemSize, itemCount * itemSize));
}
