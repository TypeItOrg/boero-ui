"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CircleAlertIcon, RefreshCwIcon, SearchIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { CommandItem } from "@common/components/ui/command";
import { Skeleton } from "@common/components/ui/skeleton";
import type { AsyncDropdownDefaultOption } from "@common/types/async-dropdown-default-option.types";
import type { AsyncDropdownRenderItemState } from "@common/types/async-dropdown-render-item-state.types";
import { cn } from "@common/utils/cn.util";

type AsyncDropdownItemProps<TItem> = {
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
  getItemValue: (item: TItem) => string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  items: TItem[];
  listClassName?: string;
  listHeight: number;
  loadNextPage: () => void;
  onSelect: (item: TItem | undefined) => void;
  renderItem?: (item: TItem, state: AsyncDropdownRenderItemState) => React.ReactNode;
  showDefaultOption: boolean;
  value?: string;
};

export function VirtualizedDropdownItems<TItem>({
  defaultOption,
  estimateSize,
  getItemLabel,
  getItemValue,
  hasNextPage,
  isFetchingNextPage,
  items,
  listClassName,
  listHeight,
  loadNextPage,
  onSelect,
  renderItem,
  showDefaultOption,
  value,
}: VirtualizedDropdownItemsProps<TItem>): React.ReactElement {
  const parentRef = React.useRef<HTMLDivElement | null>(null);
  const hasDefault = defaultOption !== undefined && showDefaultOption;
  const offset = hasDefault ? 1 : 0;
  const virtualCount = hasNextPage ? items.length + offset + 1 : items.length + offset;
  const viewportHeight = getViewportHeight({
    itemCount: virtualCount,
    itemSize: estimateSize,
    maxHeight: listHeight,
  });

  // TanStack Virtual intentionally returns non-memoizable functions.
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: virtualCount,
    estimateSize: () => estimateSize,
    getItemKey: (index) => {
      if (hasDefault && index === 0) return "__async-dropdown-default";
      const itemIndex = index - offset;
      return itemIndex < items.length ? getItemValue(items[itemIndex]) : "__async-dropdown-loader";
    },
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
  const hasScrollableOverflow = virtualContentHeight > viewportHeight;
  const lastVirtualIndex = virtualItems.at(-1)?.index;

  React.useEffect(() => {
    rowVirtualizer.scrollToOffset(0);
    rowVirtualizer.measure();
  }, [rowVirtualizer]);

  React.useEffect(() => {
    if (lastVirtualIndex === undefined || !hasNextPage || isFetchingNextPage) return;
    const itemIndex = lastVirtualIndex - offset;
    if (itemIndex >= items.length - 1) loadNextPage();
  }, [hasNextPage, isFetchingNextPage, items.length, lastVirtualIndex, loadNextPage, offset]);

  return (
    <div
      ref={parentRef}
      aria-busy={isFetchingNextPage}
      className={cn("overflow-y-auto overscroll-contain", hasScrollableOverflow && "pr-2", listClassName)}
      style={{ height: viewportHeight }}
    >
      <div className="relative w-full" style={{ height: virtualContentHeight }}>
        {virtualItems.map((virtualItem) => {
          const rowStyle = {
            height: virtualItem.size,
            transform: `translateY(${virtualItem.start}px)`,
          };

          if (hasDefault && virtualItem.index === 0) {
            return (
              <div key={virtualItem.key} className="absolute top-0 left-0 w-full" style={rowStyle}>
                <CommandItem
                  className="h-full"
                  data-checked={value === defaultOption.value}
                  onSelect={() => onSelect(undefined)}
                  value="__async-dropdown-default"
                >
                  <span className="truncate">{defaultOption.label}</span>
                </CommandItem>
              </div>
            );
          }

          const item = items[virtualItem.index - offset];

          if (!item) {
            return (
              <div key={virtualItem.key} className="absolute top-0 left-0 w-full" style={rowStyle}>
                <LoadingMoreRow itemSize={estimateSize} />
              </div>
            );
          }

          return (
            <div key={virtualItem.key} className="absolute top-0 left-0 w-full" style={rowStyle}>
              <AsyncDropdownItem
                getItemLabel={getItemLabel}
                getItemValue={getItemValue}
                item={item}
                onSelect={onSelect}
                renderItem={renderItem}
                selected={getItemValue(item) === value}
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
  getItemValue,
  item,
  onSelect,
  renderItem,
  selected,
}: AsyncDropdownItemProps<TItem>): React.ReactElement {
  return (
    <CommandItem className="h-full" data-checked={selected} onSelect={() => onSelect(item)} value={getItemValue(item)}>
      {renderItem ? renderItem(item, { selected }) : <span className="truncate">{getItemLabel(item)}</span>}
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
