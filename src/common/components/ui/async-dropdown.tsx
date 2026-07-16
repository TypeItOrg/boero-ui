"use client";

import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronsUpDownIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { COMMON_ERROR_MESSAGES } from "@common/constants/error-messages.constants";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@common/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@common/components/ui/popover";
import { Skeleton } from "@common/components/ui/skeleton";
import type { PaginationParams } from "@common/types/pagination.types";
import { useDebouncedValue } from "@/common/hooks/use-debounced-value";
import { cn } from "@common/utils/cn.util";

const DEFAULT_PAGE_SIZE = 50;
const DEFAULT_DEBOUNCE_MS = 300;
const DEFAULT_ESTIMATED_ITEM_SIZE = 36;
const DEFAULT_LIST_HEIGHT = 288;

export type AsyncDropdownPage<TItem> = {
  items: TItem[];
  nextPage: number | null;
};

export type AsyncDropdownFetchPageInput = PaginationParams & {
  search: string;
  signal: AbortSignal;
};

export type AsyncDropdownRenderItemState = {
  selected: boolean;
};

export type AsyncDropdownProps<TItem> = {
  ariaInvalid?: boolean;
  className?: string;
  contentClassName?: string;
  debounceMs?: number;
  defaultOption?: { label: string; value: string | undefined };
  disabled?: boolean;
  emptyMessage?: string;
  errorMessage?: string;
  estimateSize?: number;
  fetchPage: (input: AsyncDropdownFetchPageInput) => Promise<AsyncDropdownPage<TItem>>;
  getItemLabel: (item: TItem) => string;
  getItemValue: (item: TItem) => string;
  listClassName?: string;
  listHeight?: number;
  name?: string;
  onOpenChange?: (open: boolean) => void;
  onValueChange: (value: string | undefined, item: TItem | undefined) => void;
  open?: boolean;
  pageSize?: number;
  placeholder?: string;
  queryKey: readonly unknown[];
  renderItem?: (item: TItem, state: AsyncDropdownRenderItemState) => React.ReactNode;
  resetSearchOnClose?: boolean;
  searchPlaceholder?: string;
  selectedLabel?: string;
  value?: string;
};

type AsyncDropdownItemProps<TItem> = {
  getItemLabel: (item: TItem) => string;
  getItemValue: (item: TItem) => string;
  item: TItem;
  onSelect: (item: TItem) => void;
  renderItem?: (item: TItem, state: AsyncDropdownRenderItemState) => React.ReactNode;
  selected: boolean;
};

type VirtualizedDropdownItemsProps<TItem> = {
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
  value?: string;
  defaultOption?: { label: string; value: string | undefined };
  showDefaultOption?: boolean;
};

type SelectedTextInput<TItem> = {
  defaultOption?: { label: string; value: string | undefined };
  getItemLabel: (item: TItem) => string;
  placeholder: string;
  selectedItem: TItem | undefined;
  selectedLabel: string | undefined;
  value: string | undefined;
};

export function AsyncDropdown<TItem>({
  ariaInvalid,
  className,
  contentClassName,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  defaultOption,
  disabled = false,
  emptyMessage = "No se encontraron resultados.",
  errorMessage = COMMON_ERROR_MESSAGES.ASYNC_DROPDOWN_RESULTS,
  estimateSize = DEFAULT_ESTIMATED_ITEM_SIZE,
  fetchPage,
  getItemLabel,
  getItemValue,
  listClassName,
  listHeight = DEFAULT_LIST_HEIGHT,
  name,
  onOpenChange,
  onValueChange,
  open,
  pageSize = DEFAULT_PAGE_SIZE,
  placeholder = "Seleccionar",
  queryKey,
  renderItem,
  resetSearchOnClose = true,
  searchPlaceholder = "Buscar...",
  selectedLabel,
  value,
}: AsyncDropdownProps<TItem>): React.ReactElement {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [listRenderVersion, setListRenderVersion] = React.useState(0);
  const [search, setSearch] = React.useState("");
  const isOpen = open ?? internalOpen;
  const debouncedSearch = useDebouncedValue(search, debounceMs);
  const virtualListKey = `${listRenderVersion}-${debouncedSearch}`;

  const asyncQueryKey = React.useMemo(
    () => [...queryKey, { search: debouncedSearch, size: pageSize }],
    [debouncedSearch, pageSize, queryKey],
  );

  const query = useInfiniteQuery({
    queryKey: asyncQueryKey,
    queryFn: ({ pageParam, signal }) => fetchPage({ page: pageParam, search: debouncedSearch, signal, size: pageSize }),
    enabled: isOpen && !disabled,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  });

  const { data, fetchNextPage, hasNextPage, isError, isFetchingNextPage, isPending, refetch } = query;
  const items = React.useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const selectedItem = React.useMemo(
    () => items.find((item) => getItemValue(item) === value),
    [getItemValue, items, value],
  );
  const selectedText = getSelectedText({
    defaultOption,
    getItemLabel,
    placeholder,
    selectedItem,
    selectedLabel,
    value,
  });
  const isSelected =
    selectedItem !== undefined ||
    selectedLabel !== undefined ||
    (defaultOption !== undefined && value === defaultOption.value);
  const isPlaceholder = !isSelected;

  function setOpen(nextOpen: boolean) {
    if (nextOpen && !isOpen) setListRenderVersion((current) => current + 1);
    if (!nextOpen && resetSearchOnClose) setSearch("");
    if (open === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  function selectItem(item: TItem | undefined) {
    if (item === undefined) {
      onValueChange(defaultOption?.value, undefined);
    } else {
      onValueChange(getItemValue(item), item);
    }
    setOpen(false);
  }

  let commandListContent: React.ReactNode;
  const showDefaultOption =
    !!defaultOption && (!search || defaultOption.label.toLowerCase().includes(search.toLowerCase()));

  if (isPending) {
    commandListContent = <LoadingState itemSize={estimateSize} />;
  } else if (isError) {
    commandListContent = <ErrorState message={errorMessage} retry={() => void refetch()} />;
  } else if (items.length === 0 && !showDefaultOption) {
    commandListContent = <CommandEmpty>{emptyMessage}</CommandEmpty>;
  } else {
    commandListContent = (
      <CommandGroup className="px-1 pt-2 pb-1">
        {items.length === 0 ? (
          <>
            {showDefaultOption && (
              <CommandItem
                className="h-9"
                data-checked={value === defaultOption.value}
                onSelect={() => selectItem(undefined)}
                value="__async-dropdown-default"
              >
                <span className="truncate">{defaultOption.label}</span>
              </CommandItem>
            )}
            <div className="text-muted-foreground py-6 text-center text-sm">{emptyMessage}</div>
          </>
        ) : (
          <VirtualizedDropdownItems
            key={virtualListKey}
            estimateSize={estimateSize}
            getItemLabel={getItemLabel}
            getItemValue={getItemValue}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            items={items}
            listClassName={listClassName}
            listHeight={listHeight}
            loadNextPage={() => void fetchNextPage({ cancelRefetch: false })}
            onSelect={selectItem}
            renderItem={renderItem}
            value={value}
            defaultOption={defaultOption}
            showDefaultOption={showDefaultOption}
          />
        )}
      </CommandGroup>
    );
  }

  return (
    <>
      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
      <Popover open={isOpen} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-invalid={ariaInvalid}
            className={cn(
              "w-full justify-between text-base focus-visible:ring-1 aria-invalid:ring-0 aria-invalid:focus-visible:ring-1 md:text-sm",
              className,
            )}
            disabled={disabled}
            role="combobox"
            size="lg"
            type="button"
            variant="outline"
          >
            <span className={cn("truncate", isPlaceholder && "text-muted-foreground")}>{selectedText}</span>
            <ChevronsUpDownIcon data-icon="inline-end" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className={cn("w-(--radix-popover-trigger-width) gap-0 p-0", contentClassName)}>
          <Command shouldFilter={false} loop>
            <CommandInput
              disabled={disabled}
              onValueChange={setSearch}
              placeholder={searchPlaceholder}
              value={search}
            />
            <CommandList className="max-h-none overflow-visible p-0">{commandListContent}</CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}

function VirtualizedDropdownItems<TItem>({
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
  value,
  defaultOption,
  showDefaultOption,
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
                onSelect={(selectedItem) => onSelect(selectedItem)}
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

function LoadingState({ itemSize }: { itemSize: number }): React.ReactElement {
  return (
    <div className="flex w-full flex-col gap-1 p-1">
      <LoadingInitialRow itemSize={itemSize} className="mt-1" />
      <LoadingInitialRow itemSize={itemSize} />
    </div>
  );
}

function ErrorState({ message, retry }: { message: string; retry: () => void }): React.ReactElement {
  return (
    <div className="flex flex-col items-start gap-2 p-3">
      <p className="text-muted-foreground text-sm">{message}</p>
      <Button onClick={retry} size="sm" type="button" variant="ghost">
        Reintentar
      </Button>
    </div>
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

function getSelectedText<TItem>({
  defaultOption,
  getItemLabel,
  placeholder,
  selectedItem,
  selectedLabel,
  value,
}: SelectedTextInput<TItem>): string {
  if (selectedItem) return getItemLabel(selectedItem);
  if (selectedLabel) return selectedLabel;
  if (defaultOption && value === defaultOption.value) return defaultOption.label;
  if (value) return value;
  return placeholder;
}

function getViewportHeight({
  itemCount,
  itemSize,
  maxHeight,
}: {
  itemCount: number;
  itemSize: number;
  maxHeight: number;
}): number {
  if (itemCount === 0) return itemSize;
  return Math.min(maxHeight, Math.max(itemSize, itemCount * itemSize));
}
