import { ENROLLMENT_PERIOD_STATUS, type EnrollmentPeriodStatus } from "@features/enrollment-periods/types/enrollment-period-status.types";

const enrollmentPeriodStatusValues = new Set<string>(Object.values(ENROLLMENT_PERIOD_STATUS));

export function isEnrollmentPeriodStatus(value: unknown): value is EnrollmentPeriodStatus {
  return typeof value === "string" && enrollmentPeriodStatusValues.has(value);
}
