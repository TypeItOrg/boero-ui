const MIN_SCHEDULE_YEAR = 1900;
const MAX_SCHEDULE_YEAR = 2100;

export function isScheduleDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value &&
    date.getUTCFullYear() >= MIN_SCHEDULE_YEAR &&
    date.getUTCFullYear() <= MAX_SCHEDULE_YEAR
  );
}

export function getScheduleWeek(value: unknown, referenceDate: string): string {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Cordoba",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(referenceDate));
  const date = new Date(`${isScheduleDate(value) ? value : today}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));

  return date.toISOString().slice(0, 10);
}

export function shiftScheduleWeek(weekStart: string, offset: number): string {
  const date = new Date(`${weekStart}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset * 7);

  return date.toISOString().slice(0, 10);
}
