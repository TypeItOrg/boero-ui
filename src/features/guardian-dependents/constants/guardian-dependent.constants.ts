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
  [GUARDIAN_RELATIONSHIP.OTHER]: "Otro",
};

export const GUARDIAN_DEPENDENT_MESSAGES = {
  FETCH: "No se pudieron cargar las personas a tu cargo.",
  CREATE: "No se pudo registrar a la persona a cargo.",
  UNLINK: "No se pudo quitar a la persona a cargo.",
  FORBIDDEN: "No tenés permisos para gestionar personas a cargo.",
  REQUIRED_DOCUMENT: "El documento es requerido.",
  INVALID_DOCUMENT: "El número de documento debe tener exactamente 8 dígitos.",
  REQUIRED_NAME: "El nombre es requerido.",
  INVALID_NAME: "El nombre debe tener entre 3 y 255 letras.",
  REQUIRED_LAST_NAME: "El apellido es requerido.",
  INVALID_LAST_NAME: "El apellido debe tener entre 3 y 255 letras.",
  REQUIRED_BIRTH_DATE: "La fecha de nacimiento es requerida.",
  INVALID_BIRTH_DATE: "La persona debe tener al menos 3 años.",
  DEPENDENT_MUST_BE_MINOR: "La persona a cargo debe ser menor de 18 años.",
  INVALID_RELATIONSHIP: "Seleccioná el vínculo.",
  INVALID_PRIMARY_CONTACT: "Indicá si es tu contacto principal.",
} as const;
