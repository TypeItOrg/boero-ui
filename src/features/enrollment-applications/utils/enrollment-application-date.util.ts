const CREATED_AT_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const UPDATED_AT_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const EXPLICIT_OFFSET_PATTERN = /(?:Z|[+-]\d{2}:?\d{2})$/i;

/**
 * Backend LocalDateTime values are serialized in the API's JVM timezone (UTC)
 * without an offset marker. Pinning the input to UTC and formatting into a
 * fixed target zone keeps server and client renders identical.
 */
export function formatEnrollmentApplicationDate(value: string): string {
  const date = parseEnrollmentApplicationDate(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return CREATED_AT_FORMATTER.format(date);
}

export function formatEnrollmentApplicationDateTime(value: string): string {
  const date = parseEnrollmentApplicationDate(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return UPDATED_AT_FORMATTER.format(date);
}

function parseEnrollmentApplicationDate(value: string): Date {
  const normalizedValue = EXPLICIT_OFFSET_PATTERN.test(value) ? value : `${value}Z`;

  return new Date(normalizedValue);
}
