import { GUARDIAN_LINK_STATUS, type GuardianLinkStatus } from "@features/guardian-dependents/types/guardian-link-status.types";
import { GUARDIAN_RELATIONSHIP, type GuardianRelationship } from "@features/guardian-dependents/types/guardian-relationship.types";

/** Page that lists the dependents. Server Actions revalidate it after every change. */
export const GUARDIAN_DEPENDENTS_PAGE_PATH = "/my-dependents";

export function getGuardianDependentsApiPath(institutionId: string): string {
  return `/api/v1/institutions/${institutionId}/guardian/dependents`;
}

export const GUARDIAN_RELATIONSHIP_LABELS: Record<GuardianRelationship, string> = {
  [GUARDIAN_RELATIONSHIP.MOTHER]: "Madre",
  [GUARDIAN_RELATIONSHIP.FATHER]: "Padre",
  [GUARDIAN_RELATIONSHIP.LEGAL_GUARDIAN]: "Tutor legal",
  [GUARDIAN_RELATIONSHIP.OTHER]: "Otro vínculo",
};

export const GUARDIAN_LINK_STATUS_LABELS: Record<GuardianLinkStatus, string> = {
  [GUARDIAN_LINK_STATUS.PENDING]: "Pendiente de validación",
  [GUARDIAN_LINK_STATUS.ACTIVE]: "Aprobada",
  [GUARDIAN_LINK_STATUS.REJECTED]: "Rechazada",
  [GUARDIAN_LINK_STATUS.ENDED]: "Finalizada",
};

export const GUARDIAN_ATTACHMENT_ACCEPT = "application/pdf,image/png,image/jpeg";
export const GUARDIAN_ATTACHMENT_MAX_FILES = 5;
export const GUARDIAN_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;

export const GUARDIAN_DEPENDENT_MESSAGES = {
  FETCH: "No se pudieron cargar las personas a tu cargo.",
  CREATE: "No se pudo registrar a la persona a cargo.",
  UNLINK: "No se pudo quitar a la persona a cargo.",
  ATTACHMENTS_FAILED:
    "Tu solicitud se registró, pero no pudimos adjuntar la documentación. Cerrá esta ventana y contactá a la institución para completarla.",
  ATTACHMENT_TOO_MANY: "Podés adjuntar hasta 5 documentos.",
  ATTACHMENT_TOO_LARGE: "Cada documento puede pesar hasta 10 MB.",
  ATTACHMENT_INVALID_TYPE: "Los documentos deben ser PDF, PNG o JPG.",
  FORBIDDEN: "No tenés permisos para gestionar personas a cargo.",
  REQUIRED_DOCUMENT: "El documento es requerido.",
  INVALID_DOCUMENT: "El número de documento debe tener exactamente 8 dígitos.",
  REQUIRED_NAME: "El nombre es requerido.",
  INVALID_NAME: "El nombre debe tener entre 3 y 255 letras.",
  REQUIRED_LAST_NAME: "El apellido es requerido.",
  INVALID_LAST_NAME: "El apellido debe tener entre 3 y 255 letras.",
  REQUIRED_BIRTH_DATE: "La fecha de nacimiento es requerida.",
  INVALID_BIRTH_DATE: "La persona debe tener al menos 3 años.",
  INVALID_RELATIONSHIP: "Seleccioná el vínculo.",
  INVALID_PRIMARY_CONTACT: "Indicá si es tu contacto principal.",
} as const;
