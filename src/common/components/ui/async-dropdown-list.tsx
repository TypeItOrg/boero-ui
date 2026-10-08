"use client";

import type { ReactNode } from "react";

import { SearchIcon } from "lucide-react";

import { DropdownEmptyState, ErrorState, LoadingState, VirtualizedDropdownItems } from "@common/components/ui/async-dropdown-virtual-list";
import { CommandEmpty, CommandGroup, CommandItem } from "@common/components/ui/command";
import { useAsyncDropdown } from "@common/hooks/use-async-dropdown";
import type { AsyncDropdownProps } from "@common/types/async-dropdown-props.types";
import { cn } from "@common/utils/cn.util";

export function AsyncDropdownList<TItem>({
  emptyDescription,
  emptyIcon,
  emptyMessage,
  emptyTitle,
  errorMessage,
  estimateSize,
  defaultOption,
  getItemGroup,
  getItemLabel,
  getItemDisplayLabel,
  getItemDescription,
  getItemValue,
  groupOrder,
  compareGroups,
  value,
  listClassName,
  listHeight,
  renderItem,
  selectedValues,
  query,
  search,
  debouncedSearch,
  items,
  virtualListKey,
  selectItem,
}: Required<Pick<AsyncDropdownProps<TItem>, "emptyMessage" | "errorMessage" | "estimateSize" | "listHeight">> &
  Pick<
    AsyncDropdownProps<TItem>,
    | "emptyDescription"
    | "emptyIcon"
    | "emptyTitle"
    | "defaultOption"
    | "getItemGroup"
    | "getItemLabel"
    | "getItemDisplayLabel"
    | "getItemDescription"
    | "getItemValue"
    | "groupOrder"
    | "compareGroups"
    | "value"
    | "listClassName"
    | "renderItem"
    | "selectedValues"
  > &
  Pick<ReturnType<typeof useAsyncDropdown<TItem>>, "query" | "search" | "debouncedSearch" | "items" | "virtualListKey" | "selectItem">): ReactNode {
  const { fetchNextPage, hasNextPage, isError, isFetching, isFetchingNextPage, isPending, refetch } = query;

  let commandListContent: ReactNode;
  const showDefaultOption = !!defaultOption && (!search || defaultOption.label.toLowerCase().includes(search.toLowerCase()));
  const isLoading = isPending || (isFetching && !isFetchingNextPage);

  if (isLoading) {
    commandListContent = <LoadingState itemSize={estimateSize} />;
  } else if (isError) {
    commandListContent = <ErrorState message={errorMessage} retry={() => void refetch()} />;
  } else if (items.length === 0 && !showDefaultOption) {
    const isSearching = debouncedSearch.trim() !== "";
    const activeIcon = isSearching ? SearchIcon : (emptyIcon ?? SearchIcon);
    const activeTitle = isSearching ? "No se encontraron resultados" : (emptyTitle ?? emptyMessage);
    const activeDescription = isSearching ? `No encontramos resultados para "${debouncedSearch.trim()}".` : emptyDescription;

    commandListContent = (
      <CommandEmpty className="p-0">
        <DropdownEmptyState description={activeDescription} icon={activeIcon} title={activeTitle} />
      </CommandEmpty>
    );
  } else {
    commandListContent = (
      <CommandGroup className={cn("px-1 pt-2 pb-1", getItemGroup && "px-0")}>
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
            getItemDisplayLabel={getItemDisplayLabel}
            getItemDescription={getItemDescription}
            getItemGroup={getItemGroup}
            getItemValue={getItemValue}
            groupOrder={groupOrder}
            compareGroups={compareGroups}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            items={items}
            listClassName={listClassName}
            listHeight={listHeight}
            loadNextPage={() => void fetchNextPage({ cancelRefetch: false })}
            onSelect={selectItem}
            renderItem={renderItem}
            selectedValues={selectedValues}
            value={value}
            defaultOption={defaultOption}
            showDefaultOption={showDefaultOption}
          />
        )}
      </CommandGroup>
    );
  }

  return commandListContent;
}
