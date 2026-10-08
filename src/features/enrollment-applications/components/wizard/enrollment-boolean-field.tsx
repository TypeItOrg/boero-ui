"use client";

import type { ReactElement } from "react";

import { Field, FieldError, FieldLabel } from "@common/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";

export function EnrollmentBooleanField({
  id,
  label,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: boolean | null;
  error?: string;
  onChange: (value: boolean) => void;
}): ReactElement {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id} required>
        {label}
      </FieldLabel>
      <Select value={value === null ? undefined : value ? "yes" : "no"} onValueChange={(nextValue) => onChange(nextValue === "yes")}>
        <SelectTrigger id={id} className="h-9! w-full" aria-invalid={Boolean(error)}>
          <SelectValue placeholder="Seleccioná una opción" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="yes" className="px-2.5 py-1.5">
              Sí
            </SelectItem>
            <SelectItem value="no" className="px-2.5 py-1.5">
              No
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <FieldError errors={[{ message: error }]} />
    </Field>
  );
}
