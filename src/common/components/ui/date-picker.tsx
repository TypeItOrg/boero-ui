"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { Calendar } from "@common/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@common/components/ui/popover";
import { cn } from "@common/utils/cn.util";

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

  function handleSelect(date: Date | undefined): void {
    onChange?.(date);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          size="lg"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          className={cn(
            "bg-background w-full justify-between text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <span>{value ? format(value, "dd/MM/yyyy", { locale: es }) : "Seleccioná una fecha"}</span>
          <ChevronDownIcon data-icon="inline-end" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          captionLayout="dropdown"
          startMonth={new Date(1900, 0)}
          endMonth={maxDate ?? new Date()}
          defaultMonth={value ?? maxDate}
          disabled={maxDate ? { after: maxDate } : undefined}
          locale={es}
        />
      </PopoverContent>
    </Popover>
  );
}
