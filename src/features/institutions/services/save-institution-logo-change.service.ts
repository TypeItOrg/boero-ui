import "server-only";

import { safelyRunAction } from "@common/utils/safe-action.util";
import {
  removeInstitutionalInstitutionLogo,
  removePlatformInstitutionLogo,
  uploadInstitutionalInstitutionLogo,
  uploadPlatformInstitutionLogo,
} from "@features/institutions/actions/institution-logo.actions";
import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";
import type { InstitutionActionState } from "@features/institutions/types/institution-action-state.types";
import type { InstitutionLogoChange } from "@features/institutions/types/institution-logo-change.types";

export async function saveInstitutionLogoChange(
  institutionId: string,
  scope: "platform" | "institutional",
  change: InstitutionLogoChange,
): Promise<InstitutionActionState | undefined> {
  if (change.intent === "keep") {
    return undefined;
  }

  const upload = scope === "platform" ? uploadPlatformInstitutionLogo : uploadInstitutionalInstitutionLogo;
  const remove = scope === "platform" ? removePlatformInstitutionLogo : removeInstitutionalInstitutionLogo;
  const formData = new FormData();

  if (change.intent === "replace") {
    formData.set("file", change.file);
  }

  const fallback = change.intent === "replace" ? INSTITUTION_ERROR_MESSAGES.LOGO_UPDATE : INSTITUTION_ERROR_MESSAGES.LOGO_REMOVE;
  const result = await safelyRunAction(change.intent === "replace" ? upload(institutionId, {}, formData) : remove(institutionId), fallback);

  if (!result.success) {
    return {
      error: INSTITUTION_ERROR_MESSAGES.LOGO_PARTIAL_SAVE,
      logoError: result.fieldErrors?.file ?? result.error ?? fallback,
    };
  }

  return undefined;
}
