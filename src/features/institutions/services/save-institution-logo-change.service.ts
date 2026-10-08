import "server-only";

import { safelyRunAction } from "@common/utils/safe-action.util";

import { removeInstitutionalInstitutionLogo, uploadInstitutionalInstitutionLogo } from "@features/institutions/actions/institution-logo.actions";
import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";
import { INSTITUTION_LOGO_INTENT } from "@features/institutions/constants/institution-logo.constants";
import type { InstitutionActionState } from "@features/institutions/types/institution-action-state.types";
import type { InstitutionLogoChange } from "@features/institutions/types/institution-logo-change.types";

export async function saveInstitutionLogoChange(institutionId: string, change: InstitutionLogoChange): Promise<InstitutionActionState | undefined> {
  if (change.intent === INSTITUTION_LOGO_INTENT.KEEP) {
    return undefined;
  }

  const formData = new FormData();

  if (change.intent === INSTITUTION_LOGO_INTENT.REPLACE) {
    formData.set("file", change.file);
  }

  const fallback =
    change.intent === INSTITUTION_LOGO_INTENT.REPLACE ? INSTITUTION_ERROR_MESSAGES.LOGO_UPDATE : INSTITUTION_ERROR_MESSAGES.LOGO_REMOVE;
  const result = await safelyRunAction(
    change.intent === INSTITUTION_LOGO_INTENT.REPLACE
      ? uploadInstitutionalInstitutionLogo(institutionId, {}, formData)
      : removeInstitutionalInstitutionLogo(institutionId),
    fallback,
  );

  if (!result.success) {
    return {
      error: INSTITUTION_ERROR_MESSAGES.LOGO_PARTIAL_SAVE,
      logoError: result.fieldErrors?.file ?? result.error ?? fallback,
    };
  }

  return undefined;
}
