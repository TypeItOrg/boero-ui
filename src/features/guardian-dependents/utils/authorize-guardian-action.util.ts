import { GUARDIAN_DEPENDENT_MESSAGES } from "@features/guardian-dependents/constants/guardian-dependent.constants";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { canManageDependents } from "@features/institutional-auth/utils/institutional-applicant-role.util";

/** Friendly early check; the backend enforces the same permission and institution boundary. */
export async function authorizeGuardianAction(institutionId: string): Promise<{ error: string } | undefined> {
  const user = await requireInstitutionalUser();

  if (user.institutionId === institutionId && canManageDependents(user)) {
    return undefined;
  }

  return { error: GUARDIAN_DEPENDENT_MESSAGES.FORBIDDEN };
}
