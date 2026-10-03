"use server";

import { revalidatePath } from "next/cache";

import { INVALID_ACTION_ARGUMENTS, isValidUuid } from "@common/utils/action-argument.util";
import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import {
  GUARDIAN_ATTACHMENT_ACCEPT,
  GUARDIAN_ATTACHMENT_MAX_BYTES,
  GUARDIAN_ATTACHMENT_MAX_FILES,
  GUARDIAN_DEPENDENT_MESSAGES,
  GUARDIAN_DEPENDENTS_PAGE_PATH,
  getGuardianDependentsApiPath,
} from "@features/guardian-dependents/constants/guardian-dependent.constants";
import { createGuardianDependentSchema } from "@features/guardian-dependents/schemas/create-guardian-dependent.schema";
import { GUARDIAN_DEPENDENT_FIELD_NAMES } from "@features/guardian-dependents/types/guardian-dependent-field-name.types";
import type { GuardianDependentActionState } from "@features/guardian-dependents/types/guardian-dependent-action-state.types";
import { authorizeGuardianAction } from "@features/guardian-dependents/utils/authorize-guardian-action.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

const ACCEPTED_TYPES = GUARDIAN_ATTACHMENT_ACCEPT.split(",");

/** A browser sends an empty file entry when nothing was chosen, so those are not documents. */
function getDocuments(formData: FormData): File[] {
  return formData.getAll("documents").filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

function validateDocuments(documents: readonly File[]): string | undefined {
  if (documents.length > GUARDIAN_ATTACHMENT_MAX_FILES) {
    return GUARDIAN_DEPENDENT_MESSAGES.ATTACHMENT_TOO_MANY;
  }

  if (documents.some((document) => document.size > GUARDIAN_ATTACHMENT_MAX_BYTES)) {
    return GUARDIAN_DEPENDENT_MESSAGES.ATTACHMENT_TOO_LARGE;
  }

  if (documents.some((document) => !ACCEPTED_TYPES.includes(document.type))) {
    return GUARDIAN_DEPENDENT_MESSAGES.ATTACHMENT_INVALID_TYPE;
  }

  return undefined;
}

async function uploadDocuments(institutionId: string, response: Response, documents: readonly File[]): Promise<boolean> {
  try {
    const { personGuardianId } = (await response.json()) as { personGuardianId?: string };

    if (!personGuardianId || !isValidUuid(personGuardianId)) {
      return false;
    }

    for (const document of documents) {
      const body = new FormData();
      body.set("file", document);
      const upload = await institutionalApiFetch(`${getGuardianDependentsApiPath(institutionId)}/${personGuardianId}/attachments`, {
        method: "POST",
        body,
      });

      if (!upload.ok) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

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

  const documents = getDocuments(formData);
  const documentsError = validateDocuments(documents);

  if (documentsError) {
    return { fieldErrors: { documents: documentsError } };
  }

  const authError = await authorizeGuardianAction(institutionId);

  if (authError) {
    return authError;
  }

  let response: Response;

  try {
    response = await institutionalApiFetch(getGuardianDependentsApiPath(institutionId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { error: GUARDIAN_DEPENDENT_MESSAGES.CREATE };
  }

  const errorState = await getResponseErrorActionState(response, GUARDIAN_DEPENDENT_FIELD_NAMES, GUARDIAN_DEPENDENT_MESSAGES.CREATE);

  if (errorState) {
    return errorState;
  }

  revalidatePath(GUARDIAN_DEPENDENTS_PAGE_PATH);

  // The request already exists at this point, so a failed upload is reported without undoing it.
  if (documents.length > 0 && !(await uploadDocuments(institutionId, response, documents))) {
    return { error: GUARDIAN_DEPENDENT_MESSAGES.ATTACHMENTS_FAILED };
  }

  return { success: true };
}
