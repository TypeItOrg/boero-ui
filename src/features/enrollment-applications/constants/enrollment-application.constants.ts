import {
  ENROLLMENT_APPLICATION_STATUS,
  type EnrollmentApplicationStatus,
} from "@features/enrollment-applications/types/enrollment-application-status.types";
import { ENROLLMENT_DOCUMENT_TYPE, type EnrollmentDocumentType } from "@features/enrollment-applications/types/enrollment-document-type.types";

export const ENROLLMENT_APPLICATIONS_API_PATH = "/api/v1/enrollment-applications";

export const ACTIVE_ENROLLMENT_APPLICATION_STATUSES = [
  ENROLLMENT_APPLICATION_STATUS.DRAFT,
  ENROLLMENT_APPLICATION_STATUS.SUBMITTED,
  ENROLLMENT_APPLICATION_STATUS.APPROVED,
] as const satisfies readonly EnrollmentApplicationStatus[];

export const ENROLLMENT_APPLICATION_STATUS_LABELS: Record<EnrollmentApplicationStatus, string> = {
  [ENROLLMENT_APPLICATION_STATUS.DRAFT]: "Borrador",
  [ENROLLMENT_APPLICATION_STATUS.SUBMITTED]: "Enviada",
  [ENROLLMENT_APPLICATION_STATUS.APPROVED]: "Aprobada",
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
  [ENROLLMENT_APPLICATION_STATUS.REJECTED]: "destructive",
};

export const ENROLLMENT_APPLICATION_STATUS_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  ...Object.values(ENROLLMENT_APPLICATION_STATUS).map((status) => ({
    value: status,
    label: ENROLLMENT_APPLICATION_STATUS_LABELS[status],
  })),
] as const;

export const ENROLLMENT_DOCUMENT_TYPE_LABELS: Record<EnrollmentDocumentType, string> = {
  [ENROLLMENT_DOCUMENT_TYPE.DNI_FRONT]: "DNI Frente",
  [ENROLLMENT_DOCUMENT_TYPE.DNI_BACK]: "DNI Dorso",
  [ENROLLMENT_DOCUMENT_TYPE.SECONDARY_CERTIFICATE]: "Título Secundario",
  [ENROLLMENT_DOCUMENT_TYPE.HEALTH_REPORT]: "Informe de Salud",
  [ENROLLMENT_DOCUMENT_TYPE.PHOTO_ID]: "Foto 4x4",
};

export const EDUCATION_LEVEL_OPTIONS = [
  { value: "PRIMARY_INCOMPLETE", label: "Primario Incompleto" },
  { value: "PRIMARY_COMPLETE", label: "Primario Completo" },
  { value: "SECONDARY_INCOMPLETE", label: "Secundario Incompleto" },
  { value: "SECONDARY_COMPLETE", label: "Secundario Completo" },
  { value: "TERTIARY_INCOMPLETE", label: "Terciario / Universitario Incompleto" },
  { value: "TERTIARY_COMPLETE", label: "Terciario / Universitario Completo" },
  { value: "POSTGRADUATE", label: "Posgrado" },
] as const;
