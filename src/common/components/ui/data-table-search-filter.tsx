"use client";

import { useCallback, useRef, useState, type ReactElement } from "react";

import { SearchIcon, XIcon } from "lucide-react";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@common/components/ui/input-group";
import { useDebouncedCallback } from "@common/hooks/use-debounced-callback";

export function DataTableSearchFilter({ initialValue, onValueChange, placeholder }: DataTableSearchFilterProps): ReactElement {
  const [draft, setDraft] = useState({ source: initialValue, value: initialValue });
  const value = draft.source === initialValue ? draft.value : initialValue;

  if (draft.source !== initialValue) {
    setDraft({ source: initialValue, value: initialValue });
  }

  const inputRef = useRef<HTMLInputElement>(null);

  const commitChange = useCallback(
    (nextValue: string) => {
      const normalizedValue = nextValue.trim();

      if (normalizedValue !== initialValue) {
        onValueChange(normalizedValue);
      }
    },
    [initialValue, onValueChange],
  );

  const { schedule } = useDebouncedCallback(commitChange, SEARCH_DEBOUNCE_MS);

  function changeValue(nextValue: string): void {
    setDraft({ source: initialValue, value: nextValue });
    schedule(nextValue);
  }

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
          onChange={(event) => changeValue(event.target.value)}
          maxLength={100}
          placeholder={placeholder}
        />
        {value.length > 0 && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label="Limpiar búsqueda"
              onClick={() => {
                changeValue("");
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
