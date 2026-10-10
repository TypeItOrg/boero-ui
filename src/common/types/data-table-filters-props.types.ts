import type { ReactNode } from "react";

import { type DataTableDateFilter } from "@common/types/data-table-date-filter.types";
import { type DataTableSelectFilter } from "@common/types/data-table-select-filter.types";
import { type DataTableTriggerPosition } from "@common/types/data-table-trigger-position.types";
import { type DataTableYearFilter } from "@common/types/data-table-year-filter.types";

export type DataTableFiltersProps = {
  activeAdvancedCount?: number;
  advancedDateFilters?: readonly DataTableDateFilter[];
  advancedDescription?: string;
  advancedFilters?: ReactNode;
  advancedResetKeys?: readonly string[];
  advancedSelectFilters?: readonly DataTableSelectFilter[];
  advancedTitle?: string;
  advancedYearFilters?: readonly DataTableYearFilter[];
  children?: ReactNode;
  className?: string;
  dateFilters?: readonly DataTableDateFilter[];
  search?: string;
  searchPlaceholder?: string;
  selectFilters?: readonly DataTableSelectFilter[];
  size?: number;
  triggerPosition?: DataTableTriggerPosition;
  yearFilters?: readonly DataTableYearFilter[];
};
