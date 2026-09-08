import { EnrollmentApplicationStatus, EnrollmentDocumentType } from "../types/enrollment-application.types";

export const ENROLLMENT_APPLICATIONS_API_PATH = "/api/v1/enrollment-applications";

export const ENROLLMENT_APPLICATION_STATUS_LABELS: Record<EnrollmentApplicationStatus, string> = {
  DRAFT: "Borrador",
  SUBMITTED: "Enviada",
  APPROVED: "Aprobada",
  CANCELLED: "Cancelada",
  REJECTED: "Rechazada",
};

export const ENROLLMENT_APPLICATION_STATUS_VARIANTS: Record<
  EnrollmentApplicationStatus,
  "secondary" | "default" | "outline" | "success" | "destructive"
> = {
  DRAFT: "secondary",
  SUBMITTED: "default",
  CANCELLED: "outline",
  APPROVED: "success",
  REJECTED: "destructive",
};

export const ENROLLMENT_APPLICATION_STATUS_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "DRAFT", label: "Borrador" },
  { value: "SUBMITTED", label: "Enviada" },
  { value: "APPROVED", label: "Aprobada" },
  { value: "REJECTED", label: "Rechazada" },
  { value: "CANCELLED", label: "Cancelada" },
] as const;

export const ENROLLMENT_DOCUMENT_TYPE_LABELS: Record<EnrollmentDocumentType, string> = {
  DNI_FRONT: "DNI Frente",
  DNI_BACK: "DNI Dorso",
  SECONDARY_CERTIFICATE: "Título Secundario",
  HEALTH_REPORT: "Informe de Salud",
  PHOTO_4X4: "Foto 4x4",
};

export const SHIFT_OPTIONS = [
  { value: "MORNING", label: "Mañana" },
  { value: "AFTERNOON", label: "Tarde" },
  { value: "EVENING", label: "Noche" },
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
