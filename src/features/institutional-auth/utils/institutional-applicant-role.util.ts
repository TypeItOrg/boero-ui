import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";

const INSTITUTIONAL_STAFF_ROLE_NAMES = new Set(["Administrador Institucional", "Administrativo", "Profesor"]);

const GUARDIAN_ROLE_NAME = "Tutor";

const INSTITUTIONAL_APPLICANT_ROLE_NAMES = new Set(["Postulante", "Estudiante", GUARDIAN_ROLE_NAME]);

export function isGuardian(user: InstitutionalUser): boolean {
  return user.roles.includes(GUARDIAN_ROLE_NAME);
}

export function canManageDependents(user: InstitutionalUser): boolean {
  return hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.GUARDIAN_DEPENDENT_MANAGE);
}

export function canViewOwnEnrollmentApplications(user: InstitutionalUser): boolean {
  const hasApplicantRole = user.roles.some((role) => INSTITUTIONAL_APPLICANT_ROLE_NAMES.has(role));
  const hasStaffRole = user.roles.some((role) => INSTITUTIONAL_STAFF_ROLE_NAMES.has(role));

  return hasApplicantRole && !hasStaffRole;
}

export function canStartEnrollmentApplication(user: InstitutionalUser): boolean {
  // Guardians go through the same flow, applying on behalf of their dependents.
  const canApply = user.roles.includes("Postulante") || isGuardian(user);

  return canApply && canViewOwnEnrollmentApplications(user) && hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ACADEMIC_OFFER_READ);
}
