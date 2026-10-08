import { isValid } from "date-fns";

export function parseInitialBirthDate(value: string | null | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(`${value}T00:00:00`);

  return isValid(date) ? date : undefined;
}
