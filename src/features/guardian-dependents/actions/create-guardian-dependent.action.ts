"use server";

import { revalidatePath } from "next/cache";

import { INVALID_ACTION_ARGUMENTS, isValidUuid } from "@common/utils/action-argument.util";
import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import {
  GUARDIAN_DEPENDENT_MESSAGES,
  GUARDIAN_DEPENDENTS_PAGE_PATH,
  getGuardianDependentsApiPath,
} from "@features/guardian-dependents/constants/guardian-dependent.constants";
import { createGuardianDependentSchema } from "@features/guardian-dependents/schemas/create-guardian-dependent.schema";
import { GUARDIAN_DEPENDENT_FIELD_NAMES } from "@features/guardian-dependents/types/guardian-dependent-field-name.types";
import type { GuardianDependentActionState } from "@features/guardian-dependents/types/guardian-dependent-action-state.types";
import { authorizeGuardianAction } from "@features/guardian-dependents/utils/authorize-guardian-action.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

export async function createGuardianDependentAction(
  institutionId: string,
  _state: GuardianDependentActionState,
  formData: FormData,
): Promise<GuardianDependentActionState> {
  if (!isValidUuid(institutionId) || !(formData instanceof FormData)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const parsed = createGuardianDependentSchema.safeParse({
    documentNumber: formData.get("documentNumber") ?? "",
    firstName: formData.get("firstName") ?? "",
    lastName: formData.get("lastName") ?? "",
    birthDate: formData.get("birthDate") ?? "",
    relationship: formData.get("relationship") ?? "",
    isPrimaryContact: formData.get("isPrimaryContact") ?? "",
  });

  if (!parsed.success) {
    return getValidationActionState(parsed.error.issues, GUARDIAN_DEPENDENT_FIELD_NAMES);
  }

  const authError = await authorizeGuardianAction(institutionId);

  if (authError) {
    return authError;
  }

  const errorState = await getResponseErrorActionState(
    institutionalApiFetch(getGuardianDependentsApiPath(institutionId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    }),
    GUARDIAN_DEPENDENT_FIELD_NAMES,
    GUARDIAN_DEPENDENT_MESSAGES.CREATE,
  );

  if (errorState) {
    return errorState;
  }

  revalidatePath(GUARDIAN_DEPENDENTS_PAGE_PATH);

  return { success: true };
}
