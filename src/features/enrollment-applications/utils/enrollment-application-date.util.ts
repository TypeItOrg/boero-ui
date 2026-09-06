const CREATED_AT_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const EXPLICIT_OFFSET_PATTERN = /(?:Z|[+-]\d{2}:?\d{2})$/i;

/**
 * Backend LocalDateTime values are serialized in the API's JVM timezone (UTC)
 * without an offset marker. Pinning the input to UTC and formatting into a
 * fixed target zone keeps server and client renders identical.
 */
export function formatEnrollmentApplicationDate(value: string): string {
  const normalizedValue = EXPLICIT_OFFSET_PATTERN.test(value) ? value : `${value}Z`;
  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) return value;

  return CREATED_AT_FORMATTER.format(date);
}
