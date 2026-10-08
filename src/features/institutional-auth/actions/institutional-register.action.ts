"use server";

import { redirect } from "next/navigation";

import { validateRequestInstitutionId } from "@common/services/institutional-host/institutional-host.service";
import { getFieldErrors, pickFieldErrors } from "@common/utils/form-field-errors.util";

import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import { emailVerificationContextSchema } from "@features/institutional-auth/schemas/email-verification.schema";
import { institutionalRegisterSchema } from "@features/institutional-auth/schemas/institutional-register.schema";
import { registerInstitutionalAccount } from "@features/institutional-auth/services/register-institutional.service";
import { INSTITUTIONAL_REGISTER_FIELD_NAMES } from "@features/institutional-auth/types/institutional-register-field-name.types";
import type { InstitutionalRegisterActionState } from "@features/institutional-auth/types/institutional-register-state.types";
import { setEmailVerificationContext } from "@features/institutional-auth/utils/email-verification-context.util";

export async function registerInstitutional(
  _previousState: InstitutionalRegisterActionState,
  formData: FormData,
): Promise<InstitutionalRegisterActionState> {
  const parsed = institutionalRegisterSchema.safeParse({
    institutionId: formData.get("institutionId") ?? "",
    name: formData.get("name") ?? "",
    lastName: formData.get("lastName") ?? "",
    birthDate: formData.get("birthDate") ?? "",
    documentNumber: formData.get("documentNumber") ?? "",
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
    confirmPassword: formData.get("confirmPassword") ?? "",
  });

  if (!parsed.success) {
    return { fieldErrors: getFieldErrors(parsed.error.issues, INSTITUTIONAL_REGISTER_FIELD_NAMES) };
  }

  const contextError = await validateRequestInstitutionId(parsed.data.institutionId);

  if (contextError) {
    return { error: contextError };
  }

  const input = {
    institutionId: parsed.data.institutionId,
    name: parsed.data.name,
    lastName: parsed.data.lastName,
    birthDate: parsed.data.birthDate,
    documentNumber: parsed.data.documentNumber,
    email: parsed.data.email,
    password: parsed.data.password,
  };

  const output = await registerInstitutionalAccount(input);

  if (!output.success) {
    if (output.error.fieldErrors) {
      return {
        fieldErrors: pickFieldErrors(output.error.fieldErrors, INSTITUTIONAL_REGISTER_FIELD_NAMES),
      };
    }

    return { error: output.error.message || INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_FORM };
  }

  const identity = { institutionId: input.institutionId, documentNumber: input.documentNumber };

  const context = emailVerificationContextSchema.safeParse({
    ...identity,
    institutionName: formData.get("institutionName") || undefined,
  });

  await setEmailVerificationContext(context.success ? context.data : identity);
  redirect("/auth/email-verification");
}
