import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";

const APPLICANT_ROLE_NAME = "postulante";

export function isApplicantInstitutionalUser(user: Pick<InstitutionalUser, "roles">): boolean {
  return user.roles.some((role) => role.trim().toLocaleLowerCase("es-AR") === APPLICANT_ROLE_NAME);
}
