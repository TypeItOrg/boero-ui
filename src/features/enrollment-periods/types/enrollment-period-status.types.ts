export const ENROLLMENT_PERIOD_STATUS = {
  PLANNED: "PLANNED",
  OPEN: "OPEN",
  CLOSED: "CLOSED",
} as const;

export type EnrollmentPeriodStatus = (typeof ENROLLMENT_PERIOD_STATUS)[keyof typeof ENROLLMENT_PERIOD_STATUS];
