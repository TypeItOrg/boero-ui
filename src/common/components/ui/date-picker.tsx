"use client";

import { useId, useRef, useState, type AriaAttributes, type ChangeEvent, type ReactElement } from "react";

import { format, isValid, parse } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, XIcon } from "lucide-react";

import { Calendar } from "@common/components/ui/calendar";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@common/components/ui/input-group";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@common/components/ui/popover";
import { cn } from "@common/utils/cn.util";
import { getCalendarDefaultMonth, getCalendarEndMonth, getDisabledDates } from "@common/utils/date-picker-calendar.util";

const DISPLAY_DATE_FORMAT = "dd/MM/yyyy";

const EARLIEST_DATE = new Date(1900, 0);

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
  "aria-invalid"?: AriaAttributes["aria-invalid"];
  "aria-required"?: AriaAttributes["aria-required"];
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
}: DatePickerProps): ReactElement {
  const [open, setOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const calendarId = useId();

  const canonicalValue = value ? format(value, DISPLAY_DATE_FORMAT) : "";

  const [draftState, setDraftState] = useState<{ source: string; value?: string }>(() => ({ source: canonicalValue }));

  const draft = draftState.source === canonicalValue ? draftState.value : undefined;

  if (draftState.source !== canonicalValue) {
    setDraftState({ source: canonicalValue });
  }

  const parsedDraft = draft?.length === DISPLAY_DATE_FORMAT.length ? parseDate(draft) : undefined;

  const hasInvalidDraft =
    draft?.length === DISPLAY_DATE_FORMAT.length && (!parsedDraft || parsedDraft < minDate || (maxDate !== undefined && parsedDraft > maxDate));

  const displayValue = draft ?? canonicalValue;

  const hasValue = displayValue.length > 0;

  const hasOutOfRangeValue = value !== undefined && (value < minDate || (maxDate !== undefined && value > maxDate));

  function setDraft(nextValue: string | undefined): void {
    setDraftState({ source: canonicalValue, value: nextValue });
  }

  function commitValue(date: Date | undefined, source: "calendar" | "clear" | "input"): void {
    onChange?.(date);
    onCommit?.(date, source);
  }

  function handleSelect(date: Date | undefined): void {
    setDraft(undefined);
    onDraftChange?.("");
    setOpen(false);
    commitValue(date, "calendar");
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const nextDraft = formatDateDraft(event.target.value);

    setDraft(nextDraft);
    onDraftChange?.(nextDraft);

    if (nextDraft === "") {
      commitValue(undefined, "input");

      return;
    }

    if (nextDraft.length !== DISPLAY_DATE_FORMAT.length) {
      return;
    }

    const date = parseDate(nextDraft);

    const isAllowedDate = date !== undefined && date >= minDate && (!maxDate || date <= maxDate);

    if (isAllowedDate) {
      commitValue(date, "input");
    }
  }

  function handleBlur(): void {
    if (draft === "") {
      setDraft(undefined);
    }
  }

  function handleClear(): void {
    setDraft(undefined);
    onDraftChange?.("");
    setOpen(false);
    commitValue(undefined, "clear");
  }

  function preserveInputFocus(event: Event): void {
    if (document.activeElement === inputRef.current) {
      event.preventDefault();
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <InputGroup className={cn("h-9", className)}>
          <InputGroupInput
            ref={inputRef}
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
            aria-controls={open ? calendarId : undefined}
            aria-expanded={open}
            aria-haspopup="dialog"
            value={displayValue}
            onBlur={handleBlur}
            onChange={handleInputChange}
            onClick={() => setOpen(true)}
            onFocus={() => setOpen(true)}
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
      </PopoverAnchor>
      <PopoverContent
        id={calendarId}
        aria-label="Seleccionar fecha"
        align="start"
        className="w-auto p-0"
        onOpenAutoFocus={preserveInputFocus}
        onCloseAutoFocus={preserveInputFocus}
        onInteractOutside={(event) => {
          if (event.target === inputRef.current) {
            event.preventDefault();
          }
        }}
      >
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

function formatDateDraft(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);

  return parts.join("/");
}

function parseDate(value: string): Date | undefined {
  const date = parse(value, DISPLAY_DATE_FORMAT, new Date());

  return isValid(date) && format(date, DISPLAY_DATE_FORMAT) === value ? date : undefined;
}
