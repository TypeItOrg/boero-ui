import { parseDateInput } from "@common/utils/date-input.util";

export function calculateAge(birthDate: string | Date | undefined): number | null {
  if (!birthDate) {
    return null;
  }

  const date = typeof birthDate === "string" ? parseDateInput(birthDate) : birthDate;

  if (!date || isNaN(date.getTime())) {
    return null;
  }

  const parts = BUSINESS_DATE_FORMATTER.formatToParts(new Date());

  const year = Number(parts.find((part) => part.type === "year")?.value);

  const month = Number(parts.find((part) => part.type === "month")?.value);

  const day = Number(parts.find((part) => part.type === "day")?.value);

  let age = year - date.getFullYear();

  const monthDiff = month - 1 - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && day < date.getDate())) {
    age--;
  }

  return age >= 0 ? age : null;
}

export const BUSINESS_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Argentina/Buenos_Aires",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
