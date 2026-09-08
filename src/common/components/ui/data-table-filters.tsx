"use client";

import * as React from "react";
import { SearchIcon, XIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { DataTableAdvancedFiltersTrigger } from "@common/components/ui/data-table-advanced-filters-trigger";
import { DatePicker } from "@common/components/ui/date-picker";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@common/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@common/components/ui/sheet";
import { YearSelect } from "@common/components/ui/year-select";
import { useDebouncedValue } from "@common/hooks/use-debounced-value";
import { cn } from "@common/utils/cn.util";
import { countActiveAdvancedFilters } from "@common/utils/count-active-advanced-filters.util";
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
  activeAdvancedCount?: number;
  advancedDateFilters?: readonly DataTableDateFilter[];
  advancedDescription?: string;
  advancedFilters?: React.ReactNode;
  advancedResetKeys?: readonly string[];
  advancedSelectFilters?: readonly DataTableSelectFilter[];
  advancedTitle?: string;
  advancedYearFilters?: readonly DataTableYearFilter[];
  children?: React.ReactNode;
  className?: string;
  dateFilters?: readonly DataTableDateFilter[];
  search?: string;
  searchPlaceholder?: string;
  selectFilters?: readonly DataTableSelectFilter[];
  size?: number;
  triggerPosition?: DataTableTriggerPosition;
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

export type DataTableTriggerPosition = "inline" | "external";

export function DataTableFilters({
  activeAdvancedCount = 0,
  advancedDateFilters = [],
  advancedDescription = "Refiná la búsqueda con filtros adicionales.",
  advancedFilters,
  advancedResetKeys = [],
  advancedSelectFilters = [],
  advancedTitle = "Filtros avanzados",
  advancedYearFilters = [],
  children,
  className,
  dateFilters = [],
  search,
  searchPlaceholder,
  selectFilters = [],
  size,
  triggerPosition = "inline",
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
  const updateSearch = React.useCallback((value: string): void => updateQueryParam("search", value), [updateQueryParam]);
  const advancedTriggerLabelId = React.useId();

  function renderYearFilters(list: readonly DataTableYearFilter[]): React.ReactNode {
    return list.map((filter) => (
      <DataTableFilterYear
        key={filter.name}
        filter={filter}
        onValueChange={(value) => updateQueryParam(filter.name, value === filter.defaultValue ? undefined : value)}
      />
    ));
  }

  function renderDateFilters(list: readonly DataTableDateFilter[]): React.ReactNode {
    return list.map((filter) => <DataTableFilterDate key={filter.name} filter={filter} updateQueryParam={updateQueryParam} />);
  }

  function renderSelectFilters(list: readonly DataTableSelectFilter[]): React.ReactNode {
    return list.map((filter) => (
      <DataTableFilterSelect
        key={filter.name}
        filter={filter}
        onValueChange={(value) => updateQueryParam(filter.name, value === filter.defaultValue ? undefined : value)}
      />
    ));
  }

  const filterFields = (
    <>
      {search !== undefined && searchPlaceholder !== undefined ? (
        <DataTableSearchFilter initialValue={search} onValueChange={updateSearch} placeholder={searchPlaceholder} />
      ) : null}

      {children}

      {renderYearFilters(yearFilters)}

      {renderDateFilters(dateFilters)}

      {renderSelectFilters(selectFilters)}
    </>
  );

  const hasAdvanced =
    advancedFilters !== undefined || advancedSelectFilters.length > 0 || advancedYearFilters.length > 0 || advancedDateFilters.length > 0;

  if (!hasAdvanced) {
    return (
      <form
        className={cn("bg-muted/25 flex flex-row flex-wrap gap-3 rounded-lg border p-4 md:items-end [&>*]:flex-[1_0_min(250px,100%)]", className)}
      >
        {filterFields}
      </form>
    );
  }

  const advancedBadgeCount = countActiveAdvancedFilters({
    activeAdvancedCount,
    advancedDateFilters,
    advancedSelectFilters,
    advancedYearFilters,
  });

  function clearAdvanced(): void {
    const updates: Record<string, string | undefined> = { page: "0" };

    for (const key of advancedResetKeys) {
      updates[key] = undefined;
    }

    for (const filter of [...advancedSelectFilters, ...advancedYearFilters, ...advancedDateFilters]) {
      updates[filter.name] = undefined;
    }

    if (size !== undefined) {
      updates.size = String(size);
    }

    navigate(updates, { replace: true });
  }

  const advancedSheetContent = (
    <SheetContent side="right" showCloseButton={false}>
      <SheetHeader>
        <SheetTitle>{advancedTitle}</SheetTitle>
        <SheetDescription>{advancedDescription}</SheetDescription>
      </SheetHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 [&>*]:w-full [&>*]:!flex-none">
        {advancedFilters}

        {renderYearFilters(advancedYearFilters)}

        {renderDateFilters(advancedDateFilters)}

        {renderSelectFilters(advancedSelectFilters)}
      </div>
      <SheetFooter className="flex-row flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-[1_0_min(120px,100%)]"
          disabled={advancedBadgeCount === 0}
          onClick={clearAdvanced}
        >
          Limpiar filtros
        </Button>
        <SheetClose asChild>
          <Button type="button" size="lg" className="flex-[1_0_min(120px,100%)]">
            Ver resultados
          </Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  );

  return (
    <form
      className={cn(
        "bg-muted/25 flex flex-row flex-wrap items-end gap-3 rounded-lg border p-4 [&>*:not([data-filter-trigger])]:flex-[1_1_min(200px,100%)]",
        className,
      )}
    >
      {filterFields}

      {triggerPosition === "external" ? (
        advancedSheetContent
      ) : (
        <div data-filter-trigger className="ml-auto flex !flex-none shrink-0 flex-col gap-1.5">
          <span id={advancedTriggerLabelId} className="text-foreground text-sm font-medium">
            Filtros
          </span>
          <Sheet>
            <DataTableAdvancedFiltersTrigger count={advancedBadgeCount} labelledBy={advancedTriggerLabelId} />
            {advancedSheetContent}
          </Sheet>
        </div>
      )}
    </form>
  );
}

function DataTableFilterYear({ filter, onValueChange }: { filter: DataTableYearFilter; onValueChange: (value: string) => void }): React.ReactElement {
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
      <DatePicker autoComplete="off" className="min-w-40" value={date} onCommit={handleChange} onDraftChange={handleDraftChange} />
    </label>
  );
}

function DataTableSearchFilter({ initialValue, onValueChange, placeholder }: DataTableSearchFilterProps): React.ReactElement {
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

function DataTableFilterSelect<TValue extends string = string>({ filter, onValueChange }: DataTableFilterSelectProps<TValue>): React.ReactElement {
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
