"use server";

import { redirect } from "next/navigation";

import { getFieldErrors, pickFieldErrors } from "@common/utils/form-field-errors.util";
import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import { resetInstitutionalPasswordSchema } from "@features/institutional-auth/schemas/reset-institutional-password.schema";
import { resetInstitutionalPassword } from "@features/institutional-auth/services/reset-institutional-password.service";
import type { ResetPasswordActionState } from "@features/institutional-auth/types/reset-password-action-state.types";

const RESET_PASSWORD_FIELDS = ["password", "confirmPassword"] as const;

export async function resetPassword(_previousState: ResetPasswordActionState, formData: FormData): Promise<ResetPasswordActionState> {
  const parsed = resetInstitutionalPasswordSchema.safeParse({
    token: formData.get("token") ?? "",
    password: formData.get("password") ?? "",
    confirmPassword: formData.get("confirmPassword") ?? "",
  });

  if (!parsed.success) {
    return { fieldErrors: getFieldErrors(parsed.error.issues, RESET_PASSWORD_FIELDS) };
  }

  const output = await resetInstitutionalPassword({
    token: parsed.data.token,
    password: parsed.data.password,
    confirmPassword: parsed.data.confirmPassword,
  });
  if (output.success) redirect("/auth/login");

  if (output.error.fieldErrors) {
    return { fieldErrors: pickFieldErrors(output.error.fieldErrors, RESET_PASSWORD_FIELDS) };
  }

  return { error: output.error.message || INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_FORM };
}
