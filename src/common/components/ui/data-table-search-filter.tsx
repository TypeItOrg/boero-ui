"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";

import { SearchIcon, XIcon } from "lucide-react";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@common/components/ui/input-group";
import { useDebouncedValue } from "@common/hooks/use-debounced-value";

export function DataTableSearchFilter({ initialValue, onValueChange, placeholder }: DataTableSearchFilterProps): ReactElement {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedValue = useDebouncedValue(value, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    const normalizedValue = debouncedValue.trim();

    if (normalizedValue !== initialValue) {
      onValueChange(normalizedValue);
    }
  }, [debouncedValue, initialValue, onValueChange]);

  return (
    <label className="flex min-w-0 !flex-[2_1_min(300px,100%)] flex-col gap-1.5">
      <span className="text-foreground text-sm font-medium">Buscar</span>
      <InputGroup className="h-9">
        <InputGroupAddon align="inline-start">
          <SearchIcon className="text-muted-foreground size-4 shrink-0" />
        </InputGroupAddon>
        <InputGroupInput
          ref={inputRef}
          name="search"
          autoComplete="off"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={100}
          placeholder={placeholder}
        />
        {value.length > 0 && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label="Limpiar búsqueda"
              onClick={() => {
                setValue("");
                inputRef.current?.focus();
              }}
              size="icon-sm"
              type="button"
            >
              <XIcon aria-hidden="true" />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    </label>
  );
}

export type DataTableSearchFilterProps = {
  initialValue: string;
  onValueChange: (value: string) => void;
  placeholder: string;
};

export const SEARCH_DEBOUNCE_MS = 350;
