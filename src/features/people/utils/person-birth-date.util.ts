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
  if (!value) return undefined;

  const [year, month, day] = value.split("-").map(Number);
  if (![year, month, day].every(Number.isInteger)) return undefined;

  const date = new Date(year, month - 1, day);
  const isValidDate = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;

  return isValidDate ? date : undefined;
}

export function formatBirthDateInput(date: Date | undefined): string {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getArgentinaToday(): Date {
  const dateParts = new Map(
    ARGENTINA_DATE_FORMATTER.formatToParts(new Date()).map((part) => [part.type, Number(part.value)]),
  );

  return new Date(dateParts.get("year")!, dateParts.get("month")! - 1, dateParts.get("day")!);
}
