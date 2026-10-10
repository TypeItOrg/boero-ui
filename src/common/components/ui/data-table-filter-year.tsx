"use client";

import { useId, type ReactElement } from "react";

import { YearSelect } from "@common/components/ui/year-select";
import { type DataTableYearFilter } from "@common/types/data-table-year-filter.types";

export function DataTableFilterYear({
  filter,
  onValueChange,
}: {
  filter: DataTableYearFilter;
  onValueChange: (value: string) => void;
}): ReactElement {
  const labelId = useId();

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
