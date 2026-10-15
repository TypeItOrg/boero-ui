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
import { GUARDIAN_DEPENDENT_FIELD_NAMES } from "@features/guardian-dependents/types/guardian-dependent-field-name.types";
import { authorizeGuardianAction } from "@features/guardian-dependents/utils/authorize-guardian-action.util";
import { validateGuardianDocuments } from "@features/guardian-dependents/utils/guardian-dependent-documents.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

export async function uploadGuardianDependentDocumentAction(
  institutionId: string,
  personGuardianId: string,
  formData: FormData,
): Promise<GuardianDependentActionState> {
  if (!isValidUuid(institutionId) || !isValidUuid(personGuardianId) || !(formData instanceof FormData)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0 || formData.getAll("file").length !== 1) {
    return { fieldErrors: { documents: GUARDIAN_DEPENDENT_MESSAGES.ATTACHMENT_REQUIRED } };
  }

  const documentsError = validateGuardianDocuments([file]);

  if (documentsError) {
    return { fieldErrors: { documents: documentsError } };
  }

  const authError = await authorizeGuardianAction(institutionId);

  if (authError) {
    return authError;
  }

  const body = new FormData();

  body.set("file", file);

  const request = institutionalApiFetch(`${getGuardianDependentsApiPath(institutionId)}/${personGuardianId}/attachments`, {
    method: "POST",
    body,
  });

  const errorState = await getResponseErrorActionState(request, GUARDIAN_DEPENDENT_FIELD_NAMES, GUARDIAN_DEPENDENT_MESSAGES.ATTACHMENTS_FAILED);

  if (errorState) {
    return errorState;
  }

  revalidatePath(GUARDIAN_DEPENDENTS_PAGE_PATH);

  return { success: true };
}
