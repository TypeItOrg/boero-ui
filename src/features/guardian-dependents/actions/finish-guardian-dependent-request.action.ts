"use server";

import { redirect } from "next/navigation";

import { INVALID_ACTION_ARGUMENTS, isValidUuid } from "@common/utils/action-argument.util";
import { getSafeReturnTo } from "@common/utils/return-to.util";

import { GUARDIAN_DEPENDENTS_PAGE_PATH } from "@features/guardian-dependents/constants/guardian-dependent.constants";
import type { GuardianDependentActionState } from "@features/guardian-dependents/types/guardian-dependent-action-state.types";
import { authorizeGuardianAction } from "@features/guardian-dependents/utils/authorize-guardian-action.util";

export async function finishGuardianDependentRequestAction(institutionId: string, returnTo: string): Promise<GuardianDependentActionState> {
  if (!isValidUuid(institutionId) || typeof returnTo !== "string") {
    return { error: INVALID_ACTION_ARGUMENTS, requestCreated: true };
  }

  const authError = await authorizeGuardianAction(institutionId);

  if (authError) {
    return { ...authError, requestCreated: true };
  }

  const destination = getSafeReturnTo(returnTo, GUARDIAN_DEPENDENTS_PAGE_PATH);

  redirect(destination);
}
