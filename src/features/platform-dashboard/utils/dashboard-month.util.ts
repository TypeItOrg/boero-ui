import type { MonthlyInstitutionRegistration } from "@features/platform-dashboard/types/monthly-institution-registration.types";

const MONTH_NAMES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

export function formatDashboardMonth(
  registration: Pick<MonthlyInstitutionRegistration, "year" | "month">,
  style: "short" | "long",
): string {
  const monthName = MONTH_NAMES[registration.month - 1];

  if (!monthName) {
    return String(registration.year);
  }

  if (style === "short") {
    return `${monthName.slice(0, 3)} ${String(registration.year).slice(-2)}`;
  }

  return `${monthName} de ${registration.year}`;
}
