import { GUARDIAN_LINK_STATUS } from "@features/guardian-dependents/types/guardian-link-status.types";
import type { GuardianDependent } from "@features/guardian-dependents/types/guardian-dependent.types";

/** The API hides the name until the link is approved, so the document is the only identifier left. */
export function getGuardianDependentName(dependent: Pick<GuardianDependent, "firstName" | "lastName" | "documentNumber">): string {
  const fullName = [dependent.firstName, dependent.lastName].filter(Boolean).join(" ");

  return fullName || `DNI ${dependent.documentNumber}`;
}

/** Only approved links let the tutor represent the person, so only those can be selected to work with. */
export function filterActiveGuardianDependents(dependents: readonly GuardianDependent[]): GuardianDependent[] {
  return dependents.filter((dependent) => dependent.status === GUARDIAN_LINK_STATUS.ACTIVE);
}
