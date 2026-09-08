import type { DataTableDateFilter, DataTableSelectFilter, DataTableYearFilter } from "@common/components/ui/data-table-filters";

type CountActiveAdvancedFiltersInput = {
  activeAdvancedCount?: number;
  advancedDateFilters?: readonly DataTableDateFilter[];
  advancedSelectFilters?: readonly DataTableSelectFilter[];
  advancedYearFilters?: readonly DataTableYearFilter[];
};

export function countActiveAdvancedFilters({
  activeAdvancedCount = 0,
  advancedDateFilters = [],
  advancedSelectFilters = [],
  advancedYearFilters = [],
}: CountActiveAdvancedFiltersInput): number {
  let count = activeAdvancedCount;

  for (const filter of [...advancedSelectFilters, ...advancedYearFilters]) {
    if (filter.value !== filter.defaultValue) {
      count += 1;
    }
  }

  for (const filter of advancedDateFilters) {
    if (filter.value !== undefined) {
      count += 1;
    }
  }

  return count;
}
