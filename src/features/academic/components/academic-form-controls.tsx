import { useState } from "react";

import { Field, FieldContent, FieldError, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@common/components/ui/select";
import { Textarea } from "@common/components/ui/textarea";
import type { FormValue } from "@common/types/form-value.types";
import { cn } from "@common/utils/cn.util";
import { toFormControlValue } from "@common/utils/form-value.util";

type SharedFieldProps = {
  initialValues: Record<string, FormValue>;
  error?: string;
};

type NameFieldProps = SharedFieldProps & {
  fullWidth?: boolean;
};

type FormFieldProps = React.PropsWithChildren<{
  className?: string;
  error?: string;
  label: string;
  name: string;
  required?: boolean;
}>;

type FormSelectProps = {
  defaultValue?: string | number;
  name: string;
  onValueChange?: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  value?: string;
};

export function NameField({ initialValues, error, fullWidth = true }: NameFieldProps): React.ReactElement {
  return (
    <FormField
      label="Nombre"
      name="name"
      error={error}
      className={fullWidth ? "w-full flex-[1_0_100%]" : undefined}
      required
    >
      <Input id="name" name="name" defaultValue={toFormControlValue(initialValues.name)} maxLength={150} required />
    </FormField>
  );
}

export function DescriptionField({ initialValues, error }: SharedFieldProps): React.ReactElement {
  return (
    <FormField label="Descripción" name="description" error={error} className="w-full flex-[1_0_100%]">
      <Textarea
        id="description"
        name="description"
        defaultValue={toFormControlValue(initialValues.description)}
        maxLength={1000}
        rows={5}
      />
    </FormField>
  );
}

export function FormField({
  label,
  name,
  error,
  className,
  children,
  required = false,
}: FormFieldProps): React.ReactElement {
  return (
    <Field data-invalid={Boolean(error)} className={cn("flex-[1_0_min(350px,100%)] self-start", className)}>
      <FieldContent>
        <FieldLabel htmlFor={name} required={required}>
          {label}
        </FieldLabel>
      </FieldContent>
      {children}
      <FieldError errors={error ? [{ message: error }] : undefined} />
    </Field>
  );
}

export function FormSelect({
  name,
  defaultValue,
  options,
  placeholder,
  value: controlledValue,
  onValueChange,
}: FormSelectProps): React.ReactElement {
  const [internalValue, setInternalValue] = useState<string>(() => String(defaultValue ?? ""));
  const value = controlledValue ?? internalValue;
  const handleValueChange = onValueChange ?? setInternalValue;
  const selectedOption = options.find((option) => option.value === value);

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger id={name} className="h-9! w-full">
          <SelectValue placeholder={placeholder}>{selectedOption?.label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value} className="px-2.5 py-1.5">
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  );
}
