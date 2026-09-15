const ENROLLMENT_PERIOD_DATE_TIME_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const EXPLICIT_OFFSET_PATTERN = /(?:Z|[+-]\d{2}:?\d{2})$/i;

export function formatEnrollmentPeriodDateTime(value: string): string {
  const date = parseEnrollmentPeriodInstant(value);

  if (!date) {
    return value;
  }

  return ENROLLMENT_PERIOD_DATE_TIME_FORMATTER.format(date);
}

export function getEnrollmentPeriodDateTimeInput(value: string): { date: Date; time: string } | undefined {
  const instant = parseEnrollmentPeriodInstant(value);

  if (!instant) {
    return undefined;
  }

  const parts = new Map(ENROLLMENT_PERIOD_DATE_TIME_FORMATTER.formatToParts(instant).map((part) => [part.type, part.value]));
  const year = Number(parts.get("year"));
  const month = Number(parts.get("month"));
  const day = Number(parts.get("day"));
  const hour = parts.get("hour");
  const minute = parts.get("minute");

  if (![year, month, day].every(Number.isInteger) || !hour || !minute) {
    return undefined;
  }

  return {
    date: new Date(year, month - 1, day),
    time: `${hour}:${minute}`,
  };
}

function parseEnrollmentPeriodInstant(value: string): Date | undefined {
  const normalizedValue = EXPLICIT_OFFSET_PATTERN.test(value) ? value : `${value}Z`;
  const date = new Date(normalizedValue);

  return Number.isNaN(date.getTime()) ? undefined : date;
}
