import * as React from "react";

import { Input } from "@common/components/ui/input";

type RestrictedInputProps = Omit<React.ComponentProps<typeof Input>, "inputMode" | "pattern" | "type">;

const NON_DIGIT_PATTERN = /\D/g;
const NON_PHONE_CHARACTER_PATTERN = /[^\d-]/g;

export function NumericInput({ onChange, ...props }: RestrictedInputProps): React.ReactElement {
  return (
    <Input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      onChange={(event) => handleRestrictedChange(event, NON_DIGIT_PATTERN, onChange)}
      {...props}
    />
  );
}

export function PhoneInput({ onChange, ...props }: RestrictedInputProps): React.ReactElement {
  return (
    <Input
      type="text"
      inputMode="tel"
      pattern="[0-9-]*"
      onChange={(event) => handleRestrictedChange(event, NON_PHONE_CHARACTER_PATTERN, onChange)}
      {...props}
    />
  );
}

function handleRestrictedChange(
  event: React.ChangeEvent<HTMLInputElement>,
  disallowedCharacters: RegExp,
  onChange: React.ChangeEventHandler<HTMLInputElement> | undefined,
): void {
  event.currentTarget.value = event.currentTarget.value.replace(disallowedCharacters, "");
  onChange?.(event);
}
