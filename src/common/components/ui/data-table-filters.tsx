"use client";

import { useCallback, useId, type ReactElement, type ReactNode } from "react";

import { DataTableAdvancedFilterSheet } from "@common/components/ui/data-table-advanced-filter-sheet";
import { DataTableAdvancedFiltersTrigger } from "@common/components/ui/data-table-advanced-filters-trigger";
import { DataTableFilterDate } from "@common/components/ui/data-table-filter-date";
import { DataTableFilterSelect } from "@common/components/ui/data-table-filter-select";
import { DataTableFilterYear } from "@common/components/ui/data-table-filter-year";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTableSearchFilter } from "@common/components/ui/data-table-search-filter";
import { Sheet } from "@common/components/ui/sheet";
import { type DataTableDateFilter } from "@common/types/data-table-date-filter.types";
import { type DataTableFiltersProps } from "@common/types/data-table-filters-props.types";
import { type DataTableSelectFilter } from "@common/types/data-table-select-filter.types";
import { type DataTableYearFilter } from "@common/types/data-table-year-filter.types";
import { cn } from "@common/utils/cn.util";
import { countActiveAdvancedFilters } from "@common/utils/count-active-advanced-filters.util";

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
}: DataTableFiltersProps): ReactElement {
  const { navigate } = useDataTableNavigation();

  const updateQueryParam = useCallback(
    (name: string, value: string | undefined): void => {
      const updates: Record<string, string | undefined> = { [name]: value, page: "0" };

      if (size !== undefined) {
        updates.size = String(size);
      }

      navigate(updates, { replace: true });
    },
    [navigate, size],
  );

  const updateSearch = useCallback((value: string): void => updateQueryParam("search", value), [updateQueryParam]);

  const advancedTriggerLabelId = useId();

  function renderYearFilters(list: readonly DataTableYearFilter[]): ReactNode {
    return list.map((filter) => (
      <DataTableFilterYear
        key={filter.name}
        filter={filter}
        onValueChange={(value) => updateQueryParam(filter.name, value === filter.defaultValue ? undefined : value)}
      />
    ));
  }

  function renderDateFilters(list: readonly DataTableDateFilter[]): ReactNode {
    return list.map((filter) => <DataTableFilterDate key={filter.name} filter={filter} updateQueryParam={updateQueryParam} />);
  }

  function renderSelectFilters(list: readonly DataTableSelectFilter[]): ReactNode {
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
        onSubmit={(event) => {
          event.preventDefault();
        }}
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
    <DataTableAdvancedFilterSheet
      advancedTitle={advancedTitle}
      advancedDescription={advancedDescription}
      advancedFilters={advancedFilters}
      renderYearFilters={renderYearFilters}
      advancedYearFilters={advancedYearFilters}
      renderDateFilters={renderDateFilters}
      advancedDateFilters={advancedDateFilters}
      renderSelectFilters={renderSelectFilters}
      advancedSelectFilters={advancedSelectFilters}
      advancedBadgeCount={advancedBadgeCount}
      clearAdvanced={clearAdvanced}
    />
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
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

export type { DataTableFilterOption } from "@common/types/data-table-filter-option.types";

export type { DataTableSelectFilter } from "@common/types/data-table-select-filter.types";

export type { DataTableDateFilter } from "@common/types/data-table-date-filter.types";

export type { DataTableYearFilter } from "@common/types/data-table-year-filter.types";

export type { DataTableTriggerPosition } from "@common/types/data-table-trigger-position.types";
