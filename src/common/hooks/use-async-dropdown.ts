"use client";

import { useMemo, useState, type MouseEvent } from "react";

import { useInfiniteQuery } from "@tanstack/react-query";

import { DEFAULT_DEBOUNCE_MS, DEFAULT_PAGE_SIZE } from "@common/constants/async-dropdown-defaults.constants";
import type { AsyncDropdownProps } from "@common/types/async-dropdown-props.types";
import { getSelectedText } from "@common/utils/async-dropdown-selected-text.util";

import { useDebouncedValue } from "@/common/hooks/use-debounced-value";

export function useAsyncDropdown<TItem>({
  open,
  disabled = false,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  queryKey,
  pageSize = DEFAULT_PAGE_SIZE,
  fetchPage,
  defaultOption,
  getItemLabel,
  getItemValue,
  value,
  selectedLabel,
  placeholder = "Seleccionar",
  resetSearchOnClose = true,
  onOpenChange,
  onValueChange,
  closeOnSelect = true,
  clearable = false,
}: Pick<
  AsyncDropdownProps<TItem>,
  | "open"
  | "disabled"
  | "debounceMs"
  | "queryKey"
  | "pageSize"
  | "fetchPage"
  | "defaultOption"
  | "getItemLabel"
  | "getItemValue"
  | "value"
  | "selectedLabel"
  | "placeholder"
  | "resetSearchOnClose"
  | "onOpenChange"
  | "onValueChange"
  | "closeOnSelect"
  | "clearable"
>) {
  const [internalOpen, setInternalOpen] = useState(false);

  const [listRenderVersion, setListRenderVersion] = useState(0);

  const [search, setSearch] = useState("");

  const isOpen = open ?? internalOpen;

  const debouncedSearch = useDebouncedValue(search, debounceMs);

  const virtualListKey = `${listRenderVersion}-${debouncedSearch}`;

  const asyncQueryKey = [...queryKey, { search: debouncedSearch, size: pageSize }];

  const query = useInfiniteQuery({
    queryKey: asyncQueryKey,
    queryFn: ({ pageParam, signal }) => fetchPage({ page: pageParam, search: debouncedSearch, signal, size: pageSize }),
    enabled: isOpen && !disabled,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    refetchOnMount: "always",
    staleTime: 0,
  });

  const { data } = query;

  const items = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  const selectedItem = items.find((item) => getItemValue(item) === value);

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
    (value !== undefined && selectedLabel !== undefined) ||
    (defaultOption !== undefined && value === defaultOption.value);

  const isPlaceholder = !isSelected;

  const canClear = clearable && value !== undefined;

  function setOpen(nextOpen: boolean) {
    if (nextOpen && !isOpen) {
      setListRenderVersion((current) => current + 1);
    }

    if (!nextOpen && resetSearchOnClose) {
      setSearch("");
    }

    if (open === undefined) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  }

  function selectItem(item: TItem | undefined) {
    if (item === undefined) {
      onValueChange(defaultOption?.value, undefined);
    } else {
      onValueChange(getItemValue(item), item);
    }

    if (closeOnSelect) {
      setOpen(false);
    }
  }

  function clearValue(event: MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation();
    onValueChange(undefined, undefined);
    setOpen(false);
  }

  return {
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
  };
}
