import { useState, type PropsWithChildren, type ReactElement } from "react";

import { DropdownOptionContent } from "@common/components/ui/dropdown-option-content";
import { Field, FieldContent, FieldError, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@common/components/ui/select";
import { Textarea } from "@common/components/ui/textarea";
import { DROPDOWN_GROUP_EDGE_SPACING_CLASS_NAMES, DROPDOWN_GROUP_HEADING_CLASS_NAME } from "@common/constants/dropdown-group.constants";
import type { FormValue } from "@common/types/form-value.types";
import { cn } from "@common/utils/cn.util";
import { groupDropdownItems } from "@common/utils/dropdown-groups.util";
import { toFormControlValue } from "@common/utils/form-value.util";

type SharedFieldProps = {
  initialValues: Record<string, FormValue>;
  error?: string;
};

type NameFieldProps = SharedFieldProps & {
  fullWidth?: boolean;
};

type FormFieldProps = PropsWithChildren<{
  className?: string;
  error?: string;
  label: string;
  name: string;
  required?: boolean;
}>;

type FormSelectProps = {
  id?: string;
  defaultValue?: string | number;
  disabled?: boolean;
  name: string;
  onValueChange?: (value: string) => void;
  options: {
    value: string;
    label: string;
    disabled?: boolean;
    group?: string;
    displayLabel?: string;
    description?: string;
  }[];
  groupOrder?: readonly string[];
  placeholder?: string;
  value?: string;
};

export function NameField({ initialValues, error, fullWidth = true }: NameFieldProps): ReactElement {
  return (
    <FormField label="Nombre" name="name" error={error} className={fullWidth ? "w-full flex-[1_0_100%]" : undefined} required>
      <Input aria-invalid={Boolean(error)} defaultValue={toFormControlValue(initialValues.name)} id="name" maxLength={150} name="name" required />
    </FormField>
  );
}

export function DescriptionField({ initialValues, error }: SharedFieldProps): ReactElement {
  return (
    <FormField label="Descripción" name="description" error={error} className="w-full flex-[1_0_100%]">
      <Textarea
        aria-invalid={Boolean(error)}
        defaultValue={toFormControlValue(initialValues.description)}
        id="description"
        maxLength={1000}
        name="description"
        rows={5}
      />
    </FormField>
  );
}

export function FormField({ label, name, error, className, children, required = false }: FormFieldProps): ReactElement {
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
  id,
  defaultValue,
  disabled = false,
  options,
  groupOrder,
  placeholder,
  value: controlledValue,
  onValueChange,
}: FormSelectProps): ReactElement {
  const [internalValue, setInternalValue] = useState<string>(() => String(defaultValue ?? ""));

  const value = controlledValue ?? internalValue;

  const handleValueChange = onValueChange ?? setInternalValue;

  const selectedOption = options.find((option) => option.value === value);

  const groups = groupDropdownItems(options, (option) => option.group, groupOrder);

  const hasRichOptions = options.some((option) => option.displayLabel !== undefined);

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Select disabled={disabled} value={value} onValueChange={handleValueChange}>
        <SelectTrigger id={id ?? name} className="w-full">
          <SelectValue placeholder={placeholder}>{selectedOption?.label}</SelectValue>
        </SelectTrigger>
        <SelectContent className={hasRichOptions ? "w-(--radix-select-trigger-width)" : undefined}>
          {groups.map((group) => (
            <SelectGroup key={group.label === undefined ? "ungrouped" : `group:${group.label}`} className={group.label ? "px-0" : undefined}>
              {group.label ? <SelectLabel className={DROPDOWN_GROUP_HEADING_CLASS_NAME}>{group.label}</SelectLabel> : null}
              {group.items.map((option, index) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  textValue={option.label}
                  aria-label={option.label}
                  disabled={option.disabled}
                  className={cn(
                    "px-2.5 py-1.5",
                    option.displayLabel !== undefined && "px-3 *:last:min-w-0",
                    group.label && index === 0 && DROPDOWN_GROUP_EDGE_SPACING_CLASS_NAMES.static.first,
                    group.label && index === group.items.length - 1 && DROPDOWN_GROUP_EDGE_SPACING_CLASS_NAMES.static.last,
                  )}
                >
                  {option.displayLabel !== undefined ? (
                    <DropdownOptionContent label={option.displayLabel} description={option.description} />
                  ) : (
                    option.label
                  )}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
