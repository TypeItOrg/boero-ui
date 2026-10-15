import { safelyRunAction } from "@common/utils/safe-action.util";

import { createGuardianDependentAction } from "@features/guardian-dependents/actions/create-guardian-dependent.action";
import { uploadGuardianDependentDocumentAction } from "@features/guardian-dependents/actions/upload-guardian-dependent-document.action";
import { GUARDIAN_DEPENDENT_MESSAGES } from "@features/guardian-dependents/constants/guardian-dependent.constants";
import type { GuardianDependentActionState } from "@features/guardian-dependents/types/guardian-dependent-action-state.types";
import { getGuardianDocuments, validateGuardianDocuments } from "@features/guardian-dependents/utils/guardian-dependent-documents.util";

export async function submitGuardianDependent(
  institutionId: string,
  previous: GuardianDependentActionState,
  formData: FormData,
): Promise<GuardianDependentActionState> {
  const documents = getGuardianDocuments(formData);

  const documentsError = validateGuardianDocuments(documents);

  if (documentsError) {
    return { fieldErrors: { documents: documentsError } };
  }

  formData.delete("documents");

  const result = await safelyRunAction(createGuardianDependentAction(institutionId, previous, formData), GUARDIAN_DEPENDENT_MESSAGES.CREATE);

  if (!result.success) {
    return result;
  }

  for (const document of documents) {
    if (!result.personGuardianId) {
      return { error: GUARDIAN_DEPENDENT_MESSAGES.ATTACHMENTS_FAILED, requestCreated: true };
    }

    const body = new FormData();

    body.set("file", document);

    const upload = await safelyRunAction(
      uploadGuardianDependentDocumentAction(institutionId, result.personGuardianId, body),
      GUARDIAN_DEPENDENT_MESSAGES.ATTACHMENTS_FAILED,
    );

    if (!upload.success) {
      return { error: GUARDIAN_DEPENDENT_MESSAGES.ATTACHMENTS_FAILED, requestCreated: true };
    }
  }

  return result;
}
