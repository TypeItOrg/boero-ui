"use client";

import * as React from "react";
import { format, isValid, parse } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, XIcon } from "lucide-react";

import { Calendar } from "@common/components/ui/calendar";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@common/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@common/components/ui/popover";
import { cn } from "@common/utils/cn.util";

const DISPLAY_DATE_FORMAT = "dd/MM/yyyy";
const EARLIEST_DATE = new Date(1900, 0);
const DEFAULT_FUTURE_YEARS = 20;

type DatePickerProps = {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  onCommit?: (date: Date | undefined, source: "calendar" | "clear" | "input") => void;
  onDraftChange?: (draft: string) => void;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  calendarMinDate?: Date;
  calendarMaxDate?: Date;
  className?: string;
  autoComplete?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  "aria-required"?: React.AriaAttributes["aria-required"];
};

export function DatePicker({
  value,
  onChange,
  onCommit,
  onDraftChange,
  id,
  disabled = false,
  required = false,
  minDate = EARLIEST_DATE,
  maxDate,
  calendarMinDate = minDate,
  calendarMaxDate = maxDate,
  className,
  autoComplete = "bday",
  "aria-invalid": ariaInvalid,
  "aria-required": ariaRequired,
}: DatePickerProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<string>();
  const [hasInvalidDraft, setHasInvalidDraft] = React.useState(false);
  const displayValue = draft ?? (value ? format(value, DISPLAY_DATE_FORMAT) : "");
  const hasValue = displayValue.length > 0;
  const hasOutOfRangeValue = value !== undefined && (value < minDate || (maxDate !== undefined && value > maxDate));

  function commitValue(date: Date | undefined, source: "calendar" | "clear" | "input"): void {
    onChange?.(date);
    onCommit?.(date, source);
  }

  function handleSelect(date: Date | undefined): void {
    setDraft(undefined);
    setHasInvalidDraft(false);
    onDraftChange?.("");
    setOpen(false);
    commitValue(date, "calendar");
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const nextDraft = formatDateDraft(event.target.value);
    setDraft(nextDraft);
    onDraftChange?.(nextDraft);

    if (nextDraft === "") {
      setHasInvalidDraft(false);
      commitValue(undefined, "input");
      return;
    }

    if (nextDraft.length !== DISPLAY_DATE_FORMAT.length) {
      setHasInvalidDraft(false);
      return;
    }

    const date = parseDate(nextDraft);
    const isAllowedDate = date !== undefined && date >= minDate && (!maxDate || date <= maxDate);

    setHasInvalidDraft(!isAllowedDate);
    if (isAllowedDate) commitValue(date, "input");
  }

  function handleBlur(): void {
    if (draft === "") setDraft(undefined);
  }

  function handleClear(): void {
    setDraft(undefined);
    setHasInvalidDraft(false);
    onDraftChange?.("");
    setOpen(false);
    commitValue(undefined, "clear");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <InputGroup className={cn("h-9", className)}>
        <InputGroupInput
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete={autoComplete}
          placeholder="dd/mm/aaaa"
          maxLength={10}
          disabled={disabled}
          required={required}
          aria-invalid={ariaInvalid || hasInvalidDraft || hasOutOfRangeValue}
          aria-required={ariaRequired ?? required}
          value={displayValue}
          onBlur={handleBlur}
          onChange={handleInputChange}
        />
        <InputGroupAddon align="inline-end">
          {hasValue ? (
            <InputGroupButton aria-label="Limpiar fecha" disabled={disabled} onClick={handleClear} size="icon-xs">
              <XIcon />
            </InputGroupButton>
          ) : null}
          <PopoverTrigger asChild>
            <InputGroupButton aria-label="Abrir calendario" disabled={disabled} size="icon-xs">
              <CalendarIcon />
            </InputGroupButton>
          </PopoverTrigger>
        </InputGroupAddon>
      </InputGroup>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          captionLayout="dropdown"
          startMonth={calendarMinDate}
          endMonth={getCalendarEndMonth(calendarMinDate, calendarMaxDate)}
          defaultMonth={getCalendarDefaultMonth(value, calendarMinDate, calendarMaxDate)}
          disabled={getDisabledDates(calendarMinDate, calendarMaxDate)}
          locale={es}
        />
      </PopoverContent>
    </Popover>
  );
}

function getDefaultEndMonth(): Date {
  const today = new Date();
  return new Date(today.getFullYear() + DEFAULT_FUTURE_YEARS, 11);
}

function getCalendarEndMonth(calendarMinDate: Date, calendarMaxDate: Date | undefined): Date {
  if (calendarMaxDate) return calendarMaxDate;

  const defaultEndMonth = getDefaultEndMonth();
  if (calendarMinDate <= defaultEndMonth) return defaultEndMonth;

  return new Date(calendarMinDate.getFullYear() + DEFAULT_FUTURE_YEARS, 11);
}

function getCalendarDefaultMonth(value: Date | undefined, minDate: Date, maxDate: Date | undefined): Date {
  const candidate = value ?? new Date();
  if (candidate < minDate) return minDate;
  if (maxDate && candidate > maxDate) return maxDate;
  return candidate;
}

function getDisabledDates(minDate: Date, maxDate: Date | undefined): { before: Date; after?: Date } {
  return maxDate ? { before: minDate, after: maxDate } : { before: minDate };
}

function formatDateDraft(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);

  return parts.join("/");
}

function parseDate(value: string): Date | undefined {
  const date = parse(value, DISPLAY_DATE_FORMAT, new Date());

  return isValid(date) && format(date, DISPLAY_DATE_FORMAT) === value ? date : undefined;
}
