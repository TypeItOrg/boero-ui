"use client";

import type { ReactElement, ReactNode } from "react";

import { Button } from "@common/components/ui/button";
import { SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@common/components/ui/sheet";
import { type DataTableDateFilter } from "@common/types/data-table-date-filter.types";
import { type DataTableSelectFilter } from "@common/types/data-table-select-filter.types";
import { type DataTableYearFilter } from "@common/types/data-table-year-filter.types";

export function DataTableAdvancedFilterSheet({
  advancedTitle,
  advancedDescription,
  advancedFilters,
  renderYearFilters,
  advancedYearFilters,
  renderDateFilters,
  advancedDateFilters,
  renderSelectFilters,
  advancedSelectFilters,
  advancedBadgeCount,
  clearAdvanced,
}: {
  advancedTitle: string;
  advancedDescription: string;
  advancedFilters: ReactNode;
  renderYearFilters: (list: readonly DataTableYearFilter[]) => ReactNode;
  advancedYearFilters: readonly DataTableYearFilter[];
  renderDateFilters: (list: readonly DataTableDateFilter[]) => ReactNode;
  advancedDateFilters: readonly DataTableDateFilter[];
  renderSelectFilters: (list: readonly DataTableSelectFilter[]) => ReactNode;
  advancedSelectFilters: readonly DataTableSelectFilter[];
  advancedBadgeCount: number;
  clearAdvanced: () => void;
}): ReactElement {
  return (
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
}
