import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";

const INSTITUTIONAL_APPLICANT_ROLE_NAMES = new Set(["Postulante", "Estudiante"]);

export function canViewOwnEnrollmentApplications(user: InstitutionalUser): boolean {
  const hasApplicantRole = user.roles.some((role) => INSTITUTIONAL_APPLICANT_ROLE_NAMES.has(role));

  return hasApplicantRole;
}

export function canStartEnrollmentApplication(user: InstitutionalUser): boolean {
  return canViewOwnEnrollmentApplications(user);
}
