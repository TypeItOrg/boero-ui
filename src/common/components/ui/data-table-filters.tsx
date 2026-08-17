"use client";

import * as React from "react";
import { SearchIcon, XIcon } from "lucide-react";

import { DatePicker } from "@common/components/ui/date-picker";
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
import { YearSelect } from "@common/components/ui/year-select";
import { useDebouncedValue } from "@common/hooks/use-debounced-value";
import { cn } from "@common/utils/cn.util";
import { formatDateInput, parseDateInput } from "@common/utils/date-input.util";

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

export type DataTableDateFilter = {
  label: string;
  name: string;
  value: string | undefined;
};

export type DataTableYearFilter = {
  defaultValue: "all";
  label: string;
  maxYear: number;
  minYear: number;
  name: string;
  value: string;
};

type DataTableFiltersProps = {
  children?: React.ReactNode;
  className?: string;
  dateFilters?: readonly DataTableDateFilter[];
  search?: string;
  searchPlaceholder?: string;
  selectFilters?: readonly DataTableSelectFilter[];
  size?: number;
  yearFilters?: readonly DataTableYearFilter[];
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

type PendingDateFilterValue = {
  value: string | undefined;
};

const SEARCH_DEBOUNCE_MS = 350;
const DATE_FILTER_DEBOUNCE_MS = 350;

export function DataTableFilters({
  children,
  className,
  dateFilters = [],
  search,
  searchPlaceholder,
  selectFilters = [],
  size,
  yearFilters = [],
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
    <form
      className={cn(
        "bg-muted/25 flex flex-row flex-wrap gap-3 rounded-lg border p-4 md:items-end [&>*]:flex-[1_0_min(250px,100%)]",
        className,
      )}
    >
      {search !== undefined && searchPlaceholder !== undefined ? (
        <DataTableSearchFilter initialValue={search} onValueChange={updateSearch} placeholder={searchPlaceholder} />
      ) : null}

      {children}

      {yearFilters.map((filter) => (
        <DataTableFilterYear
          key={filter.name}
          filter={filter}
          onValueChange={(value) => updateQueryParam(filter.name, value === filter.defaultValue ? undefined : value)}
        />
      ))}

      {dateFilters.map((filter) => (
        <DataTableFilterDate key={filter.name} filter={filter} updateQueryParam={updateQueryParam} />
      ))}

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

function DataTableFilterYear({
  filter,
  onValueChange,
}: {
  filter: DataTableYearFilter;
  onValueChange: (value: string) => void;
}): React.ReactElement {
  const labelId = React.useId();

  return (
    <div className="flex min-w-0 !flex-[1_0_min(160px,100%)] flex-col gap-1.5">
      <span id={labelId} className="text-foreground text-sm font-medium">
        {filter.label}
      </span>
      <YearSelect
        allOptionLabel="Todos"
        ariaLabelledBy={labelId}
        className="h-9! min-w-36"
        maxYear={filter.maxYear}
        minYear={filter.minYear}
        value={filter.value}
        onValueChange={onValueChange}
      />
    </div>
  );
}

function DataTableFilterDate({
  filter,
  updateQueryParam,
}: {
  filter: DataTableDateFilter;
  updateQueryParam: (name: string, value: string | undefined) => void;
}): React.ReactElement {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(() => parseDateInput(filter.value));
  const [pendingInputValue, setPendingInputValue] = React.useState<PendingDateFilterValue | null>(null);
  const debouncedInputValue = useDebouncedValue(pendingInputValue, DATE_FILTER_DEBOUNCE_MS);
  const date = pendingInputValue?.value === filter.value ? selectedDate : parseDateInput(filter.value);

  React.useEffect(() => {
    if (debouncedInputValue && debouncedInputValue.value !== filter.value) {
      updateQueryParam(filter.name, debouncedInputValue.value);
    }
  }, [debouncedInputValue, filter.name, filter.value, updateQueryParam]);

  function handleChange(value: Date | undefined, source: "calendar" | "clear" | "input"): void {
    setSelectedDate(value);
    const formattedValue = value ? formatDateInput(value) : undefined;

    if (source === "input") {
      setPendingInputValue({ value: formattedValue });
      return;
    }

    setPendingInputValue(null);
    updateQueryParam(filter.name, formattedValue);
  }

  function handleDraftChange(): void {
    setPendingInputValue(null);
  }

  return (
    <label className="flex min-w-0 !flex-[1_0_min(200px,100%)] flex-col gap-1.5">
      <span className="text-foreground text-sm font-medium">{filter.label}</span>
      <DatePicker
        autoComplete="off"
        className="min-w-40"
        value={date}
        onCommit={handleChange}
        onDraftChange={handleDraftChange}
      />
    </label>
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
    <label className="flex min-w-0 !flex-[2_1_min(300px,100%)] flex-col gap-1.5">
      <span className="text-foreground text-sm font-medium">Buscar</span>
      <InputGroup className="h-9">
        <InputGroupAddon align="inline-start">
          <SearchIcon className="text-muted-foreground size-4 shrink-0" />
        </InputGroupAddon>
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
    <div className="flex min-w-0 flex-col gap-1.5">
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
