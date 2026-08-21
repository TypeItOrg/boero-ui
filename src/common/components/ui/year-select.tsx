"use client";

import * as React from "react";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";
import { cn } from "@common/utils/cn.util";

type YearSelectProps = Omit<React.ComponentProps<typeof Select>, "children"> & {
  allOptionLabel?: string;
  ariaInvalid?: boolean;
  ariaLabelledBy?: string;
  className?: string;
  id?: string;
  maxYear: number;
  minYear: number;
  placeholder?: string;
};

export function YearSelect({
  allOptionLabel,
  ariaInvalid,
  ariaLabelledBy,
  className,
  id,
  maxYear,
  minYear,
  placeholder = "Seleccionar año",
  value,
  ...props
}: YearSelectProps): React.ReactElement {
  const years = getDescendingYears(minYear, maxYear);
  const selectedLabel = getSelectedLabel(value, allOptionLabel);

  return (
    <Select {...props} value={value ?? ""}>
      <SelectTrigger id={id} aria-invalid={ariaInvalid} aria-labelledby={ariaLabelledBy} className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder}>{selectedLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {allOptionLabel ? (
            <SelectItem value="all" className="px-2.5 py-1.5">
              {allOptionLabel}
            </SelectItem>
          ) : null}
          {years.map((year) => (
            <SelectItem key={year} value={String(year)} className="px-2.5 py-1.5">
              {year}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function getSelectedLabel(value: string | undefined, allOptionLabel: string | undefined): string | undefined {
  if (value === "all") return allOptionLabel;
  return value;
}

function getDescendingYears(minYear: number, maxYear: number): number[] {
  if (minYear > maxYear) return [];
  return Array.from({ length: maxYear - minYear + 1 }, (_, index) => maxYear - index);
}
