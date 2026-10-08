"use client";

import { useCallback, type ReactElement } from "react";

import { DatePicker } from "@common/components/ui/date-picker";
import { useDebouncedCallback } from "@common/hooks/use-debounced-callback";
import { type DataTableDateFilter } from "@common/types/data-table-date-filter.types";
import { formatDateInput, parseDateInput } from "@common/utils/date-input.util";

export function DataTableFilterDate({
  filter,
  updateQueryParam,
}: {
  filter: DataTableDateFilter;
  updateQueryParam: (name: string, value: string | undefined) => void;
}): ReactElement {
  const commitInput = useCallback(
    (value: string | undefined) => {
      if (value !== filter.value) {
        updateQueryParam(filter.name, value);
      }
    },
    [filter.name, filter.value, updateQueryParam],
  );

  const { schedule, cancel } = useDebouncedCallback(commitInput, DATE_FILTER_DEBOUNCE_MS);

  function handleChange(value: Date | undefined, source: "calendar" | "clear" | "input"): void {
    const formattedValue = value ? formatDateInput(value) : undefined;

    if (source === "input") {
      schedule(formattedValue);

      return;
    }

    cancel();
    updateQueryParam(filter.name, formattedValue);
  }

  return (
    <label className="flex min-w-0 !flex-[1_0_min(200px,100%)] flex-col gap-1.5">
      <span className="text-foreground text-sm font-medium">{filter.label}</span>
      <DatePicker autoComplete="off" className="min-w-40" value={parseDateInput(filter.value)} onCommit={handleChange} onDraftChange={cancel} />
    </label>
  );
}

export const DATE_FILTER_DEBOUNCE_MS = 350;
