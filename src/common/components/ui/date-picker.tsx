"use client";

import * as React from "react";
import { format, isValid, parse } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { Calendar } from "@common/components/ui/calendar";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@common/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@common/components/ui/popover";
import { cn } from "@common/utils/cn.util";

const DISPLAY_DATE_FORMAT = "dd/MM/yyyy";
const EARLIEST_DATE = new Date(1900, 0);

type DatePickerProps = {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  id?: string;
  disabled?: boolean;
  maxDate?: Date;
  className?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
};

export function DatePicker({
  value,
  onChange,
  id,
  disabled = false,
  maxDate,
  className,
  "aria-invalid": ariaInvalid,
}: DatePickerProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<string>();
  const [hasInvalidDraft, setHasInvalidDraft] = React.useState(false);
  const displayValue = draft ?? (value ? format(value, DISPLAY_DATE_FORMAT) : "");

  function handleSelect(date: Date | undefined): void {
    setDraft(undefined);
    setHasInvalidDraft(false);
    onChange?.(date);
    setOpen(false);
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const nextDraft = formatDateDraft(event.target.value);
    setDraft(nextDraft);
    onChange?.(undefined);

    if (nextDraft.length !== DISPLAY_DATE_FORMAT.length) {
      setHasInvalidDraft(false);
      return;
    }

    const date = parseDate(nextDraft);
    const isAllowedDate = date !== undefined && date >= EARLIEST_DATE && (!maxDate || date <= maxDate);

    setHasInvalidDraft(!isAllowedDate);
    if (isAllowedDate) onChange?.(date);
  }

  function handleBlur(): void {
    if (draft === "") setDraft(undefined);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <InputGroup className={cn("h-9", className)}>
        <InputGroupInput
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="bday"
          placeholder="dd/mm/aaaa"
          maxLength={10}
          disabled={disabled}
          aria-invalid={ariaInvalid || hasInvalidDraft}
          value={displayValue}
          onBlur={handleBlur}
          onChange={handleInputChange}
        />
        <InputGroupAddon align="inline-end">
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
          startMonth={EARLIEST_DATE}
          endMonth={maxDate ?? new Date()}
          defaultMonth={value ?? maxDate}
          disabled={maxDate ? { after: maxDate } : undefined}
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
