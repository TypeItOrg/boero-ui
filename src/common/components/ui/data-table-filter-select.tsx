"use client";

import { useId, type ReactElement } from "react";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";
import { type DataTableSelectFilter } from "@common/types/data-table-select-filter.types";

export function DataTableFilterSelect<TValue extends string = string>({ filter, onValueChange }: DataTableFilterSelectProps<TValue>): ReactElement {
  const labelId = useId();

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

export type DataTableFilterSelectProps<TValue extends string> = {
  filter: DataTableSelectFilter<TValue>;
  onValueChange: (value: TValue) => void;
};
