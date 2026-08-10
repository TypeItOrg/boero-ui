export function parseDateInput(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;

  const [year, month, day] = value.split("-").map(Number);
  if (![year, month, day].every(Number.isInteger)) return undefined;

  const date = new Date(year, month - 1, day);
  const isValidDate = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;

  return isValidDate ? date : undefined;
}

export function formatDateInput(date: Date | undefined): string {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(value: string | null | undefined, fallback = "—"): string {
  const date = parseDateInput(value);
  if (!date) return value || fallback;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${day}/${month}/${date.getFullYear()}`;
}
