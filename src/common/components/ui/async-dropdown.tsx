"use client";

import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronsUpDownIcon, SearchIcon, XIcon } from "lucide-react";

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
import {
  DropdownEmptyState,
  ErrorState,
  LoadingState,
  VirtualizedDropdownItems,
} from "@common/components/ui/async-dropdown-virtual-list";
import { Popover, PopoverContent, PopoverTrigger } from "@common/components/ui/popover";
import type { AsyncDropdownDefaultOption } from "@common/types/async-dropdown-default-option.types";
import type { AsyncDropdownProps } from "@common/types/async-dropdown-props.types";
import { useDebouncedValue } from "@/common/hooks/use-debounced-value";
import { cn } from "@common/utils/cn.util";

export type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
export type { AsyncDropdownPage } from "@common/types/async-dropdown-page.types";
export type { AsyncDropdownProps } from "@common/types/async-dropdown-props.types";
export type { AsyncDropdownRenderItemState } from "@common/types/async-dropdown-render-item-state.types";

const DEFAULT_PAGE_SIZE = 50;
const DEFAULT_DEBOUNCE_MS = 300;
const DEFAULT_ESTIMATED_ITEM_SIZE = 36;
const DEFAULT_LIST_HEIGHT = 288;

type SelectedTextInput<TItem> = {
  defaultOption?: AsyncDropdownDefaultOption;
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
  clearLabel = "Limpiar selección",
  clearable = false,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  defaultOption,
  disabled = false,
  emptyDescription,
  emptyIcon,
  emptyMessage = "No se encontraron resultados.",
  emptyTitle,
  errorMessage = COMMON_ERROR_MESSAGES.ASYNC_DROPDOWN_RESULTS,
  estimateSize = DEFAULT_ESTIMATED_ITEM_SIZE,
  fetchPage,
  getItemLabel,
  getItemValue,
  id,
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
    refetchOnMount: "always",
    staleTime: 0,
  });

  const { data, fetchNextPage, hasNextPage, isError, isFetching, isFetchingNextPage, isPending, refetch } = query;
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
  const canClear = clearable && value !== undefined;

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

  function clearValue(event: React.MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation();
    onValueChange(undefined, undefined);
    setOpen(false);
  }

  let commandListContent: React.ReactNode;
  const showDefaultOption =
    !!defaultOption && (!search || defaultOption.label.toLowerCase().includes(search.toLowerCase()));
  const isLoading = isPending || (isFetching && !isFetchingNextPage);

  if (isLoading) {
    commandListContent = <LoadingState itemSize={estimateSize} />;
  } else if (isError) {
    commandListContent = <ErrorState message={errorMessage} retry={() => void refetch()} />;
  } else if (items.length === 0 && !showDefaultOption) {
    const isSearching = debouncedSearch.trim() !== "";
    const activeIcon = isSearching ? SearchIcon : (emptyIcon ?? SearchIcon);
    const activeTitle = isSearching ? "No se encontraron resultados" : (emptyTitle ?? emptyMessage);
    const activeDescription = isSearching
      ? `No encontramos resultados para "${debouncedSearch.trim()}".`
      : emptyDescription;

    commandListContent = (
      <CommandEmpty className="p-0">
        <DropdownEmptyState description={activeDescription} icon={activeIcon} title={activeTitle} />
      </CommandEmpty>
    );
  } else {
    commandListContent = (
      <CommandGroup className="px-1 pt-2 pb-1">
        {items.length === 0 ? (
          <CommandItem
            className="h-9"
            data-checked={value === defaultOption?.value}
            onSelect={() => selectItem(undefined)}
            value="__async-dropdown-default"
          >
            <span className="truncate">{defaultOption?.label}</span>
          </CommandItem>
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
        <div className="relative w-full">
          <PopoverTrigger asChild>
            <Button
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              aria-invalid={ariaInvalid}
              className={cn(
                "w-full justify-between text-base focus-visible:ring-1 aria-invalid:ring-0 aria-invalid:focus-visible:ring-1 md:text-sm",
                canClear && "pr-16",
                className,
              )}
              disabled={disabled}
              id={id}
              role="combobox"
              size="lg"
              type="button"
              variant="outline"
            >
              <span className={cn("truncate font-normal", isPlaceholder && "text-muted-foreground")}>
                {selectedText}
              </span>
              <ChevronsUpDownIcon data-icon="inline-end" />
            </Button>
          </PopoverTrigger>
          {canClear ? (
            <Button
              aria-label={clearLabel}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-9 size-6 -translate-y-1/2 rounded-[calc(var(--radius)-3px)] p-0 [&>svg:not([class*='size-'])]:size-4"
              disabled={disabled}
              onClick={clearValue}
              size="icon-xs"
              type="button"
              variant="ghost"
            >
              <XIcon />
            </Button>
          ) : null}
        </div>
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
