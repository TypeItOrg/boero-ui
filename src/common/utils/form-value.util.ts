import type { FormValue } from "@common/types/form-value.types";

export function toFormControlValue(input: FormValue): string | number {
  return typeof input === "boolean" ? String(input) : (input ?? "");
}

export function toOptionalFormString(input: FormValue): string | undefined {
  const value = toFormControlValue(input);
  return value === "" ? undefined : String(value);
}
