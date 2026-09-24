"use server";

import { revalidatePath } from "next/cache";

import { INVALID_ACTION_ARGUMENTS, isValidUuid } from "@common/utils/action-argument.util";
import { getResponseErrorActionState } from "@common/utils/action-state.util";
import {
  GUARDIAN_DEPENDENT_MESSAGES,
  GUARDIAN_DEPENDENTS_PAGE_PATH,
  getGuardianDependentsApiPath,
} from "@features/guardian-dependents/constants/guardian-dependent.constants";
import type { GuardianDependentActionState } from "@features/guardian-dependents/types/guardian-dependent-action-state.types";
import { authorizeGuardianAction } from "@features/guardian-dependents/utils/authorize-guardian-action.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

export async function unlinkGuardianDependentAction(institutionId: string, dependentPersonId: string): Promise<GuardianDependentActionState> {
  if (!isValidUuid(institutionId) || !isValidUuid(dependentPersonId)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const authError = await authorizeGuardianAction(institutionId);

  if (authError) {
    return authError;
  }

  const errorState = await getResponseErrorActionState(
    institutionalApiFetch(`${getGuardianDependentsApiPath(institutionId)}/${dependentPersonId}`, { method: "DELETE" }),
    [],
    GUARDIAN_DEPENDENT_MESSAGES.UNLINK,
  );

  if (errorState) {
    return errorState;
  }

  revalidatePath(GUARDIAN_DEPENDENTS_PAGE_PATH);

  return { success: true };
}
