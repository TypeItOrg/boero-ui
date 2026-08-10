import { formatDateInput, parseDateInput } from "@common/utils/date-input.util";

export const MIN_ACADEMIC_YEAR = 2000;

const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";
const MAX_YEAR_OFFSET = 1;
const ACADEMIC_YEAR_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: ARGENTINA_TIME_ZONE,
  year: "numeric",
});

export function getCurrentAcademicYear(date = new Date()): number {
  return Number(ACADEMIC_YEAR_FORMATTER.format(date));
}

export function getMaxAcademicYear(date = new Date()): number {
  return getCurrentAcademicYear(date) + MAX_YEAR_OFFSET;
}

export function isAcademicYearInRange(year: number, date = new Date()): boolean {
  return Number.isInteger(year) && year >= MIN_ACADEMIC_YEAR && year <= getMaxAcademicYear(date);
}

export function parseAcademicYearFilter(value: string | string[] | undefined): number | undefined {
  if (typeof value !== "string" || !/^\d{4}$/.test(value)) return undefined;

  const year = Number(value);
  return isAcademicYearInRange(year) ? year : undefined;
}

export function parseAcademicDateFilter(value: string | string[] | undefined): string | undefined {
  if (typeof value !== "string") return undefined;

  const date = parseDateInput(value);
  return date ? formatDateInput(date) : undefined;
}

export function isAcademicYearStartDate(year: number, value: string | null | undefined): boolean {
  const date = value ? parseDateInput(value) : undefined;
  return date === undefined || date.getFullYear() === year;
}

export function isAcademicYearEndDate(year: number, value: string | null | undefined): boolean {
  const date = value ? parseDateInput(value) : undefined;
  return date === undefined || date.getFullYear() === year || date.getFullYear() === year + 1;
}
