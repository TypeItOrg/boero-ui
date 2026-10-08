import { DATA_TABLE_EMPTY_MESSAGES } from "@common/constants/data-table-empty.constants";

import {
  ENROLLMENT_APPLICATION_STATUS,
  type EnrollmentApplicationStatus,
} from "@features/enrollment-applications/types/enrollment-application-status.types";

export const ENROLLMENT_PAGE_PATH = "/enrollment";

export const ENROLLMENT_APPLICATIONS_API_PATH = "/api/v1/enrollment-applications";

export const ENROLLMENT_SUBMISSION_ERROR_FIELDS = [
  "applicant",
  "personalData.firstName",
  "personalData.lastName",
  "personalData.documentNumber",
  "personalData.email",
  "responsible",
  "responsible.fullName",
  "responsible.documentNumber",
  "responsible.phoneNumber",
  "academicBackground",
  "academicBackground.currentlyStudying",
  "academicBackground.educationLevel",
  "academicBackground.schoolOrigin",
  "academicBackground.levelCompleted",
  "academicBackground.secondaryCompleted",
  "courses",
  "preference.preferredShift",
  "preference.previousTeacher",
] as const;

export const ACTIVE_ENROLLMENT_APPLICATION_STATUSES = [
  ENROLLMENT_APPLICATION_STATUS.DRAFT,
  ENROLLMENT_APPLICATION_STATUS.SUBMITTED,
  ENROLLMENT_APPLICATION_STATUS.APPROVED,
  ENROLLMENT_APPLICATION_STATUS.PROVISIONALLY_APPROVED,
] as const satisfies readonly EnrollmentApplicationStatus[];

export const ENROLLMENT_APPLICATION_STATUS_LABELS: Record<EnrollmentApplicationStatus, string> = {
  [ENROLLMENT_APPLICATION_STATUS.DRAFT]: "Borrador",
  [ENROLLMENT_APPLICATION_STATUS.SUBMITTED]: "Enviada",
  [ENROLLMENT_APPLICATION_STATUS.APPROVED]: "Confirmada definitivamente",
  [ENROLLMENT_APPLICATION_STATUS.PROVISIONALLY_APPROVED]: "Admitida provisoriamente",
  [ENROLLMENT_APPLICATION_STATUS.CANCELLED]: "Cancelada",
  [ENROLLMENT_APPLICATION_STATUS.REJECTED]: "Rechazada",
};

export const ENROLLMENT_APPLICATION_STATUS_VARIANTS: Record<
  EnrollmentApplicationStatus,
  "secondary" | "default" | "outline" | "success" | "destructive"
> = {
  [ENROLLMENT_APPLICATION_STATUS.DRAFT]: "secondary",
  [ENROLLMENT_APPLICATION_STATUS.SUBMITTED]: "default",
  [ENROLLMENT_APPLICATION_STATUS.CANCELLED]: "outline",
  [ENROLLMENT_APPLICATION_STATUS.APPROVED]: "success",
  [ENROLLMENT_APPLICATION_STATUS.PROVISIONALLY_APPROVED]: "outline",
  [ENROLLMENT_APPLICATION_STATUS.REJECTED]: "destructive",
};

export const ENROLLMENT_APPLICATION_STATUS_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  ...Object.values(ENROLLMENT_APPLICATION_STATUS).map((status) => ({
    value: status,
    label: ENROLLMENT_APPLICATION_STATUS_LABELS[status],
  })),
] as const;

export const EDUCATION_LEVEL_OPTIONS = [
  { value: "PRIMARY_INCOMPLETE", label: "Primario Incompleto" },
  { value: "PRIMARY_COMPLETE", label: "Primario Completo" },
  { value: "SECONDARY_INCOMPLETE", label: "Secundario Incompleto" },
  { value: "SECONDARY_COMPLETE", label: "Secundario Completo" },
  { value: "TERTIARY_INCOMPLETE", label: "Terciario / Universitario Incompleto" },
  { value: "TERTIARY_COMPLETE", label: "Terciario / Universitario Completo" },
  { value: "POSTGRADUATE", label: "Posgrado" },
] as const;

export const SCHOOLING_EDUCATION_LEVEL_OPTIONS = [
  { value: "INITIAL", label: "Inicial" },
  { value: "PRIMARY", label: "Primario" },
  { value: "SECONDARY", label: "Secundario" },
  { value: "NON_UNIVERSITY_HIGHER", label: "Superior no universitario" },
  { value: "UNIVERSITY", label: "Universitario" },
] as const;

export const SCHOOLING_EDUCATION_LEVEL_LABELS = {
  NO_SCHOOLING: "Sin escolarización",
  INITIAL: "Inicial",
  PRIMARY: "Primario",
  SECONDARY: "Secundario",
  NON_UNIVERSITY_HIGHER: "Superior no universitario",
  UNIVERSITY: "Universitario",
} as const;

export const ENROLLMENT_APPLICATION_FILTER_MESSAGES = {
  UNAVAILABLE_TRAINING_PATH: "Trayecto no disponible",
  NO_RESULTS_TITLE: "No se encontraron solicitudes",
  NO_RESULTS_DESCRIPTION: DATA_TABLE_EMPTY_MESSAGES.FILTERED_DESCRIPTION,
} as const;
