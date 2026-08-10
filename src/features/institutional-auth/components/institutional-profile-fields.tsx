import * as React from "react";

import { DatePicker } from "@common/components/ui/date-picker";
import { Field, FieldContent, FieldError, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { formatBirthDateInput, getLatestAllowedBirthDate } from "@features/people/utils/person-birth-date.util";

export function TextField({
  id,
  name,
  label,
  description,
  error,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { label: string; description?: string; error?: string }): React.ReactElement {
  return (
    <Field
      className={className ?? "flex-[1_0_min(240px,100%)]"}
      data-disabled={props.disabled}
      data-invalid={Boolean(error)}
    >
      <FieldContent>
        <FieldLabel htmlFor={id} required={props.required}>
          {label}
        </FieldLabel>
        {description ? <p className="text-muted-foreground text-xs">{description}</p> : null}
      </FieldContent>
      <Input id={id} name={name} aria-invalid={Boolean(error)} {...props} />
      <FieldError>{error}</FieldError>
    </Field>
  );
}

export function DropdownField({
  id,
  label,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <Field className="flex-[1_0_min(240px,100%)]" data-invalid={Boolean(error)}>
      <FieldContent>
        <FieldLabel htmlFor={id} required={required}>
          {label}
        </FieldLabel>
      </FieldContent>
      {children}
      <FieldError>{error}</FieldError>
    </Field>
  );
}

export function DateField({
  id,
  label,
  name,
  onChange,
  error,
  required,
  value,
}: {
  id: string;
  label: string;
  name: string;
  onChange: (date: Date | undefined) => void;
  error?: string;
  required?: boolean;
  value?: Date;
}): React.ReactElement {
  return (
    <Field className="flex-[1_0_min(240px,100%)]" data-invalid={Boolean(error)}>
      <FieldContent>
        <FieldLabel htmlFor={id} required={required}>
          {label}
        </FieldLabel>
      </FieldContent>
      <input type="hidden" name={name} value={formatBirthDateInput(value)} />
      <DatePicker
        id={id}
        value={value}
        onChange={onChange}
        maxDate={getLatestAllowedBirthDate()}
        aria-invalid={Boolean(error)}
      />
      <FieldError>{error}</FieldError>
    </Field>
  );
}
