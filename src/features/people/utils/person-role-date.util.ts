const ROLE_ASSIGNED_AT_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function formatRoleAssignedAt(value: string | undefined): string {
  if (!value) return "Asignación pendiente";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return ROLE_ASSIGNED_AT_FORMATTER.format(date);
}
