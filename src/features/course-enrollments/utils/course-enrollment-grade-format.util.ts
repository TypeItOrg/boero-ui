const gradeFormatter = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatGradeValue(value: number | string): string {
  const numeric = typeof value === "string" ? Number(value) : value;

  if (!Number.isFinite(numeric)) {
    return String(value);
  }

  return gradeFormatter.format(numeric);
}
