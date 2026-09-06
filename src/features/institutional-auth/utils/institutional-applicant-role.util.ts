import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";

const INSTITUTIONAL_STAFF_ROLE_NAMES = new Set(["Administrador Institucional", "Administrativo", "Profesor", "Tutor"]);

const INSTITUTIONAL_APPLICANT_ROLE_NAMES = new Set(["Postulante", "Estudiante"]);

export function canViewOwnEnrollmentApplications(user: InstitutionalUser): boolean {
  const hasApplicantRole = user.roles.some((role) => INSTITUTIONAL_APPLICANT_ROLE_NAMES.has(role));
  const hasStaffRole = user.roles.some((role) => INSTITUTIONAL_STAFF_ROLE_NAMES.has(role));

  return hasApplicantRole && !hasStaffRole;
}
