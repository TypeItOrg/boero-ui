"use client";

import type { ReactElement } from "react";

import { AsyncDropdownList } from "@common/components/ui/async-dropdown-list";
import { AsyncDropdownTrigger } from "@common/components/ui/async-dropdown-trigger";
import { Command, CommandInput, CommandList } from "@common/components/ui/command";
import { Popover, PopoverContent } from "@common/components/ui/popover";
import {
  DEFAULT_DEBOUNCE_MS,
  DEFAULT_ESTIMATED_ITEM_SIZE,
  DEFAULT_LIST_HEIGHT,
  DEFAULT_PAGE_SIZE,
} from "@common/constants/async-dropdown-defaults.constants";
import { COMMON_ERROR_MESSAGES } from "@common/constants/error-messages.constants";
import { useAsyncDropdown } from "@common/hooks/use-async-dropdown";
import type { AsyncDropdownProps } from "@common/types/async-dropdown-props.types";
import { cn } from "@common/utils/cn.util";

export type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
export type { AsyncDropdownPage } from "@common/types/async-dropdown-page.types";
export type { AsyncDropdownProps } from "@common/types/async-dropdown-props.types";
export type { AsyncDropdownRenderItemState } from "@common/types/async-dropdown-render-item-state.types";

export function AsyncDropdown<TItem>({
  ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  "aria-required": ariaRequired,
  className,
  contentClassName,
  clearLabel = "Limpiar selección",
  clearable = false,
  closeOnSelect = true,
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
  getItemDisplayLabel,
  getItemDescription,
  getItemGroup,
  getItemValue,
  groupOrder,
  compareGroups,
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
  selectedValues,
  value,
}: AsyncDropdownProps<TItem>): ReactElement {
  const {
    isOpen,
    virtualListKey,
    search,
    setSearch,
    debouncedSearch,
    query,
    items,
    selectedText,
    isPlaceholder,
    canClear,
    setOpen,
    selectItem,
    clearValue,
  } = useAsyncDropdown({
    open,
    disabled,
    debounceMs,
    queryKey,
    pageSize,
    fetchPage,
    defaultOption,
    getItemLabel,
    getItemValue,
    value,
    selectedLabel,
    placeholder,
    resetSearchOnClose,
    onOpenChange,
    onValueChange,
    closeOnSelect,
    clearable,
  });

  return (
    <>
      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
      <Popover open={isOpen} onOpenChange={setOpen}>
        <AsyncDropdownTrigger
          isOpen={isOpen}
          ariaInvalid={ariaInvalid}
          ariaDescribedBy={ariaDescribedBy}
          ariaRequired={ariaRequired}
          className={className}
          disabled={disabled}
          id={id}
          canClear={canClear}
          isPlaceholder={isPlaceholder}
          selectedText={selectedText}
          clearLabel={clearLabel}
          clearValue={clearValue}
        />
        <PopoverContent align="start" className={cn("w-(--radix-popover-trigger-width) gap-0 p-0", contentClassName)}>
          <Command className={getItemGroup ? "px-0 [&_[data-slot=command-input-wrapper]]:px-2" : undefined} shouldFilter={false} loop>
            <CommandInput disabled={disabled} onValueChange={setSearch} placeholder={searchPlaceholder} value={search} />
            <CommandList aria-multiselectable={selectedValues !== undefined || undefined} className="max-h-none overflow-visible p-0">
              <AsyncDropdownList
                emptyDescription={emptyDescription}
                emptyIcon={emptyIcon}
                emptyMessage={emptyMessage}
                emptyTitle={emptyTitle}
                errorMessage={errorMessage}
                estimateSize={estimateSize}
                defaultOption={defaultOption}
                getItemGroup={getItemGroup}
                getItemLabel={getItemLabel}
                getItemDisplayLabel={getItemDisplayLabel}
                getItemDescription={getItemDescription}
                getItemValue={getItemValue}
                groupOrder={groupOrder}
                compareGroups={compareGroups}
                value={value}
                listClassName={listClassName}
                listHeight={listHeight}
                renderItem={renderItem}
                selectedValues={selectedValues}
                query={query}
                search={search}
                debouncedSearch={debouncedSearch}
                items={items}
                virtualListKey={virtualListKey}
                selectItem={selectItem}
              />
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
