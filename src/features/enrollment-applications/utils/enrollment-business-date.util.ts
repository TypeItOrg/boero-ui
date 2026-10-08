"use client";

import { format, isValid } from "date-fns";

export function formatBusinessDate(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);

  return isValid(date) ? format(date, "dd/MM/yyyy") : value;
}
