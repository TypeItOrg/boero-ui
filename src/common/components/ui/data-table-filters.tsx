"use client";

import * as React from "react";
import { XIcon } from "lucide-react";

import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@common/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@common/components/ui/select";
import { useDebouncedValue } from "@common/hooks/use-debounced-value";
import { cn } from "@common/utils/cn.util";

export type DataTableFilterOption<TValue extends string = string> = {
  label: string;
  value: TValue;
};

export type DataTableSelectFilter<TValue extends string = string> = {
  defaultValue: TValue;
  label: string;
  name: string;
  options: readonly DataTableFilterOption<TValue>[];
  value: TValue;
};

type DataTableFiltersProps = {
  children?: React.ReactNode;
  className?: string;
  search: string;
  searchPlaceholder: string;
  selectFilters?: readonly DataTableSelectFilter[];
  size?: number;
};

type DataTableFilterSelectProps<TValue extends string> = {
  filter: DataTableSelectFilter<TValue>;
  onValueChange: (value: TValue) => void;
};

type DataTableSearchFilterProps = {
  initialValue: string;
  onValueChange: (value: string) => void;
  placeholder: string;
};

const SEARCH_DEBOUNCE_MS = 350;

export function DataTableFilters({
  children,
  className,
  search,
  searchPlaceholder,
  selectFilters = [],
  size,
}: DataTableFiltersProps): React.ReactElement {
  const { navigate } = useDataTableNavigation();

  const updateQueryParam = React.useCallback(
    (name: string, value: string | undefined): void => {
      const updates: Record<string, string | undefined> = { [name]: value, page: "0" };

      if (size !== undefined) {
        updates.size = String(size);
      }

      navigate(updates, { replace: true });
    },
    [navigate, size],
  );
  const updateSearch = React.useCallback(
    (value: string): void => updateQueryParam("search", value),
    [updateQueryParam],
  );

  return (
    <form className={cn("bg-muted/25 grid gap-3 rounded-lg border p-4 md:items-end", className)}>
      <DataTableSearchFilter initialValue={search} onValueChange={updateSearch} placeholder={searchPlaceholder} />

      {children}

      {selectFilters.map((filter) => (
        <DataTableFilterSelect
          key={filter.name}
          filter={filter}
          onValueChange={(value) => updateQueryParam(filter.name, value === filter.defaultValue ? undefined : value)}
        />
      ))}
    </form>
  );
}

function DataTableSearchFilter({
  initialValue,
  onValueChange,
  placeholder,
}: DataTableSearchFilterProps): React.ReactElement {
  const [value, setValue] = React.useState(initialValue);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debouncedValue = useDebouncedValue(value, SEARCH_DEBOUNCE_MS);

  React.useEffect(() => {
    const normalizedValue = debouncedValue.trim();

    if (normalizedValue !== initialValue) {
      onValueChange(normalizedValue);
    }
  }, [debouncedValue, initialValue, onValueChange]);

  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-foreground text-sm font-medium">Buscar</span>
      <InputGroup className="h-9">
        <InputGroupInput
          ref={inputRef}
          name="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={100}
          placeholder={placeholder}
        />
        {value.length > 0 && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label="Limpiar búsqueda"
              onClick={() => {
                setValue("");
                inputRef.current?.focus();
              }}
              size="icon-sm"
              type="button"
            >
              <XIcon aria-hidden="true" />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    </label>
  );
}

function DataTableFilterSelect<TValue extends string = string>({
  filter,
  onValueChange,
}: DataTableFilterSelectProps<TValue>): React.ReactElement {
  const labelId = React.useId();
  const selectedLabel = filter.options.find((option) => option.value === filter.value)?.label;

  return (
    <div className="flex flex-col gap-1.5">
      <span id={labelId} className="text-foreground text-sm font-medium">
        {filter.label}
      </span>
      <Select value={filter.value} onValueChange={(value) => onValueChange(value as TValue)}>
        <SelectTrigger className="h-9! w-full min-w-36" aria-labelledby={labelId}>
          <SelectValue>{selectedLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value} className="px-2.5 py-1.5">
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
