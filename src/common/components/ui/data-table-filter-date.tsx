"use client";

import { useEffect, useState, type ReactElement } from "react";

import { DatePicker } from "@common/components/ui/date-picker";
import { useDebouncedValue } from "@common/hooks/use-debounced-value";
import { type DataTableDateFilter } from "@common/types/data-table-date-filter.types";
import { formatDateInput, parseDateInput } from "@common/utils/date-input.util";

export function DataTableFilterDate({
  filter,
  updateQueryParam,
}: {
  filter: DataTableDateFilter;
  updateQueryParam: (name: string, value: string | undefined) => void;
}): ReactElement {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => parseDateInput(filter.value));
  const [pendingInputValue, setPendingInputValue] = useState<PendingDateFilterValue | null>(null);
  const debouncedInputValue = useDebouncedValue(pendingInputValue, DATE_FILTER_DEBOUNCE_MS);
  const date = pendingInputValue?.value === filter.value ? selectedDate : parseDateInput(filter.value);

  useEffect(() => {
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

export type PendingDateFilterValue = {
  value: string | undefined;
};

export const DATE_FILTER_DEBOUNCE_MS = 350;
