import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";

const INSTITUTIONAL_STAFF_ROLE_NAMES = new Set(["Administrador Institucional", "Administrativo", "Profesor", "Tutor"]);

const INSTITUTIONAL_APPLICANT_ROLE_NAMES = new Set(["Postulante", "Estudiante"]);

export function canViewOwnEnrollmentApplications(user: InstitutionalUser): boolean {
  const hasApplicantRole = user.roles.some((role) => INSTITUTIONAL_APPLICANT_ROLE_NAMES.has(role));
  const hasStaffRole = user.roles.some((role) => INSTITUTIONAL_STAFF_ROLE_NAMES.has(role));

  return hasApplicantRole && !hasStaffRole;
}

export function canStartEnrollmentApplication(user: InstitutionalUser): boolean {
  const isApplicant = user.roles.includes("Postulante");

  return isApplicant && canViewOwnEnrollmentApplications(user) && hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ACADEMIC_OFFER_READ);
}
