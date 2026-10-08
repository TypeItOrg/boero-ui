import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";
import {
  INSTITUTION_LOGO_INTENT,
  INSTITUTION_LOGO_MIME_TYPES,
  MAX_INSTITUTION_LOGO_BYTES,
} from "@features/institutions/constants/institution-logo.constants";
import type { InstitutionLogoChange } from "@features/institutions/types/institution-logo-change.types";

export function getInstitutionLogoFileError(file: File): string | undefined {
  if (file.size > MAX_INSTITUTION_LOGO_BYTES) {
    return INSTITUTION_ERROR_MESSAGES.LOGO_TOO_LARGE;
  }

  if (!INSTITUTION_LOGO_MIME_TYPES.some((type) => type === file.type) || file.size === 0) {
    return INSTITUTION_ERROR_MESSAGES.LOGO_INVALID_FILE;
  }

  return undefined;
}

export function appendInstitutionLogoChange(formData: FormData, change: InstitutionLogoChange): void {
  formData.set("logoIntent", change.intent);
  formData.delete("logoFile");

  if (change.intent === INSTITUTION_LOGO_INTENT.REPLACE) {
    formData.set("logoFile", change.file);
  }
}

export function parseInstitutionLogoChange(formData: FormData): InstitutionLogoChange | { error: string } {
  const intent = formData.get("logoIntent");
  const file = formData.get("logoFile");

  if (formData.getAll("logoFile").length > 1) {
    return { error: INSTITUTION_ERROR_MESSAGES.LOGO_SINGLE_FILE };
  }

  if ((intent === INSTITUTION_LOGO_INTENT.KEEP || intent === INSTITUTION_LOGO_INTENT.REMOVE) && file === null) {
    return { intent };
  }

  if (intent !== INSTITUTION_LOGO_INTENT.REPLACE || !(file instanceof File)) {
    return { error: INSTITUTION_ERROR_MESSAGES.LOGO_INVALID_CHANGE };
  }

  const error = getInstitutionLogoFileError(file);

  if (error) {
    return { error };
  }

  return { intent, file };
}
