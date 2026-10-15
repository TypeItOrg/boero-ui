import {
  GUARDIAN_ATTACHMENT_ACCEPT,
  GUARDIAN_ATTACHMENT_MAX_BYTES,
  GUARDIAN_ATTACHMENT_MAX_FILES,
  GUARDIAN_DEPENDENT_MESSAGES,
} from "@features/guardian-dependents/constants/guardian-dependent.constants";

const ACCEPTED_TYPES = GUARDIAN_ATTACHMENT_ACCEPT.split(",");

export function getGuardianDocuments(formData: FormData): File[] {
  return formData.getAll("documents").filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

export function validateGuardianDocuments(documents: readonly File[]): string | undefined {
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
