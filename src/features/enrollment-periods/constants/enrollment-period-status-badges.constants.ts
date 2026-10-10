import { ENROLLMENT_PERIOD_STATUS, type EnrollmentPeriodStatus } from "@features/enrollment-periods/types/enrollment-period-status.types";

export const statusBadges: Record<EnrollmentPeriodStatus, { label: string; variant: "outline" | "default" | "secondary" | "destructive" }> = {
  [ENROLLMENT_PERIOD_STATUS.PLANNED]: { label: "Planificado", variant: "secondary" },
  [ENROLLMENT_PERIOD_STATUS.OPEN]: { label: "Abierto", variant: "default" },
  [ENROLLMENT_PERIOD_STATUS.CLOSED]: { label: "Cerrado", variant: "destructive" },
};
