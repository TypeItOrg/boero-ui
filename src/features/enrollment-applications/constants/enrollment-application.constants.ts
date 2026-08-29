import { EnrollmentApplicationStatus } from "../types/enrollment-application.types";

export const ENROLLMENT_APPLICATIONS_API_PATH = "/api/v1/enrollment-applications";

export const ENROLLMENT_APPLICATION_STATUS_LABELS: Record<EnrollmentApplicationStatus, string> = {
  DRAFT: "Borrador",
  SUBMITTED: "Enviada",
  CANCELLED: "Cancelada",
  REJECTED: "Rechazada",
};
