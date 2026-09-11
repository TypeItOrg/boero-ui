import { ENROLLMENT_APPLICATION_STATUS } from "../types/enrollment-application-status.types";
import type { EnrollmentApplicationStatus } from "../types/enrollment-application-status.types";
import { ENROLLMENT_APPLICATION_STATUS_LABELS } from "../constants/enrollment-application.constants";

const enrollmentApplicationStatusValues = new Set<string>(Object.values(ENROLLMENT_APPLICATION_STATUS));

export function isEnrollmentApplicationStatus(value: unknown): value is EnrollmentApplicationStatus {
  return typeof value === "string" && enrollmentApplicationStatusValues.has(value);
}

export function getEnrollmentApplicationStatusLabel(status: EnrollmentApplicationStatus): string {
  return ENROLLMENT_APPLICATION_STATUS_LABELS[status];
}
