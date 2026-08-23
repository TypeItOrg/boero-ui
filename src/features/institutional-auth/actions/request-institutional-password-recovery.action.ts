"use server";

import { getFieldErrors, pickFieldErrors } from "@common/utils/form-field-errors.util";
import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import { institutionalPasswordRecoverySchema } from "@features/institutional-auth/schemas/institutional-password-recovery.schema";
import { requestInstitutionalPasswordRecovery } from "@features/institutional-auth/services/request-institutional-password-recovery.service";
import type { PasswordRecoveryActionState } from "@features/institutional-auth/types/password-recovery-action-state.types";

const PASSWORD_RECOVERY_FIELDS = ["institutionId", "documentNumber"] as const;

export async function requestPasswordRecovery(_previousState: PasswordRecoveryActionState, formData: FormData): Promise<PasswordRecoveryActionState> {
  const parsed = institutionalPasswordRecoverySchema.safeParse({
    institutionId: formData.get("institutionId") ?? "",
    documentNumber: formData.get("documentNumber") ?? "",
  });

  if (!parsed.success) {
    return { fieldErrors: getFieldErrors(parsed.error.issues, PASSWORD_RECOVERY_FIELDS) };
  }

  const output = await requestInstitutionalPasswordRecovery(parsed.data);
  if (output.success) return { success: true };

  if (output.error.fieldErrors) {
    return { fieldErrors: pickFieldErrors(output.error.fieldErrors, PASSWORD_RECOVERY_FIELDS) };
  }

  return { error: output.error.message || INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_FORM };
}
