import { formatDateInput, parseDateInput } from "@common/utils/date-input.util";

const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";
const MINIMUM_PERSON_AGE = 3;

const ARGENTINA_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: ARGENTINA_TIME_ZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

export function getLatestAllowedBirthDate(today = getArgentinaToday()): Date {
  const targetYear = today.getFullYear() - MINIMUM_PERSON_AGE;
  const month = today.getMonth();
  const lastDayOfTargetMonth = new Date(targetYear, month + 1, 0).getDate();

  return new Date(targetYear, month, Math.min(today.getDate(), lastDayOfTargetMonth));
}

export function hasMinimumPersonAge(value: string, today = getArgentinaToday()): boolean {
  const birthDate = parseBirthDateInput(value);
  return birthDate !== undefined && birthDate <= getLatestAllowedBirthDate(today);
}

export function parseBirthDateInput(value: string | null): Date | undefined {
  return parseDateInput(value);
}

export function formatBirthDateInput(date: Date | undefined): string {
  return formatDateInput(date);
}

function getArgentinaToday(): Date {
  const dateParts = new Map(ARGENTINA_DATE_FORMATTER.formatToParts(new Date()).map((part) => [part.type, Number(part.value)]));

  return new Date(dateParts.get("year")!, dateParts.get("month")! - 1, dateParts.get("day")!);
}
