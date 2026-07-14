const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

export function formatDashboardDate(value: string): string {
  const match = ISO_DATE_PATTERN.exec(value);

  if (!match) {
    return value;
  }

  const [, year, month, day] = match;

  return `${day}/${month}/${year}`;
}
