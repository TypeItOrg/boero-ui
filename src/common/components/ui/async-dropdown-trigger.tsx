"use client";

import type { AriaAttributes, MouseEvent, ReactElement } from "react";

import { ChevronsUpDownIcon, XIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { PopoverTrigger } from "@common/components/ui/popover";
import { cn } from "@common/utils/cn.util";

export function AsyncDropdownTrigger({
  isOpen,
  ariaInvalid,
  ariaDescribedBy,
  ariaRequired,
  className,
  disabled,
  id,
  canClear,
  isPlaceholder,
  selectedText,
  clearLabel,
  clearValue,
}: {
  isOpen: boolean;
  ariaInvalid: boolean | undefined;
  ariaDescribedBy: string | undefined;
  ariaRequired: AriaAttributes["aria-required"];
  className: string | undefined;
  disabled: boolean;
  id: string | undefined;
  canClear: boolean;
  isPlaceholder: boolean;
  selectedText: string;
  clearLabel: string;
  clearValue: (event: MouseEvent<HTMLButtonElement>) => void;
}): ReactElement {
  return (
    <div className="relative w-full">
      <PopoverTrigger asChild>
        <Button
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          aria-required={ariaRequired}
          className={cn(
            "w-full justify-between text-base focus-visible:ring-1 aria-invalid:ring-0 aria-invalid:focus-visible:ring-1 md:text-sm",
            className,
          )}
          disabled={disabled}
          id={id}
          role="combobox"
          size="lg"
          type="button"
          variant="outline"
        >
          <span className={cn("min-w-0 flex-1 truncate text-left font-normal", canClear && "mr-8", isPlaceholder && "text-muted-foreground")}>
            {selectedText}
          </span>
          <ChevronsUpDownIcon data-icon="inline-end" />
        </Button>
      </PopoverTrigger>
      {canClear ? (
        <Button
          aria-label={clearLabel}
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-9 size-6 -translate-y-1/2 rounded-[calc(var(--radius)-3px)] p-0 [&>svg:not([class*='size-'])]:size-4"
          disabled={disabled}
          onClick={clearValue}
          size="icon-xs"
          type="button"
          variant="ghost"
        >
          <XIcon />
        </Button>
      ) : null}
    </div>
  );
}
