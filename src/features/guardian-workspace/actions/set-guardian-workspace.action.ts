"use server";

import { isValidUuid } from "@common/utils/action-argument.util";

import { fetchGuardianDependents } from "@features/guardian-dependents/services/guardian-dependent.service";
import { filterActiveGuardianDependents } from "@features/guardian-dependents/utils/guardian-dependent-display.util";
import { GUARDIAN_WORKSPACE_MESSAGES } from "@features/guardian-workspace/constants/guardian-workspace.constants";
import { setGuardianWorkspaceId } from "@features/guardian-workspace/utils/guardian-workspace-cookie.util";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { canManageDependents } from "@features/institutional-auth/utils/institutional-applicant-role.util";

type SetGuardianWorkspaceResult = { success: true } | { error: string };

export async function setGuardianWorkspaceAction(dependentPersonId: string): Promise<SetGuardianWorkspaceResult> {
  if (!isValidUuid(dependentPersonId)) {
    return { error: GUARDIAN_WORKSPACE_MESSAGES.INVALID_DEPENDENT };
  }

  const user = await requireInstitutionalUser();

  if (!canManageDependents(user)) {
    return { error: GUARDIAN_WORKSPACE_MESSAGES.INVALID_DEPENDENT };
  }

  try {
    // Only an approved link lets the tutor work on behalf of the person.
    const dependents = filterActiveGuardianDependents(await fetchGuardianDependents(user.institutionId));

    const belongsToUser = dependents.some((dependent) => dependent.dependentPersonId === dependentPersonId);

    if (!belongsToUser) {
      return { error: GUARDIAN_WORKSPACE_MESSAGES.INVALID_DEPENDENT };
    }

    await setGuardianWorkspaceId(dependentPersonId);

    return { success: true };
  } catch {
    return { error: GUARDIAN_WORKSPACE_MESSAGES.UNAVAILABLE };
  }
}
