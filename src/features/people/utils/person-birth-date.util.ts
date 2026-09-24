import { formatDateInput, parseDateInput } from "@common/utils/date-input.util";

const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";
const MINIMUM_PERSON_AGE = 3;
const ADULT_AGE = 18;

const ARGENTINA_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: ARGENTINA_TIME_ZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

export function getLatestAllowedBirthDate(today = getArgentinaToday()): Date {
  return subtractYears(today, MINIMUM_PERSON_AGE);
}

export function getEarliestMinorBirthDate(today = getArgentinaToday()): Date {
  const eighteenthBirthday = subtractYears(today, ADULT_AGE);

  return new Date(eighteenthBirthday.getFullYear(), eighteenthBirthday.getMonth(), eighteenthBirthday.getDate() + 1);
}

export function hasMinimumPersonAge(value: string, today = getArgentinaToday()): boolean {
  const birthDate = parseBirthDateInput(value);
  return birthDate !== undefined && birthDate <= getLatestAllowedBirthDate(today);
}

// A person who turns 18 today is already an adult, so only dates after "today minus 18 years" are minors.
export function isMinorBirthDate(value: string, today = getArgentinaToday()): boolean {
  const birthDate = parseBirthDateInput(value);
  return birthDate !== undefined && birthDate > subtractYears(today, ADULT_AGE);
}

export function parseBirthDateInput(value: string | null): Date | undefined {
  return parseDateInput(value);
}

export function formatBirthDateInput(date: Date | undefined): string {
  return formatDateInput(date);
}

function subtractYears(today: Date, years: number): Date {
  const targetYear = today.getFullYear() - years;
  const month = today.getMonth();
  const lastDayOfTargetMonth = new Date(targetYear, month + 1, 0).getDate();

  return new Date(targetYear, month, Math.min(today.getDate(), lastDayOfTargetMonth));
}

function getArgentinaToday(): Date {
  const dateParts = new Map(ARGENTINA_DATE_FORMATTER.formatToParts(new Date()).map((part) => [part.type, Number(part.value)]));

  return new Date(dateParts.get("year")!, dateParts.get("month")! - 1, dateParts.get("day")!);
}
