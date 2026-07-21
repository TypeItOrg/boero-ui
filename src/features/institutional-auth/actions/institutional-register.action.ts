"use server";

import { redirect } from "next/navigation";

import { getFieldErrors, pickFieldErrors } from "@common/utils/form-field-errors.util";
import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import { registerInstitutionalAccount } from "@features/institutional-auth/services/register-institutional.service";
import { institutionalRegisterSchema } from "@features/institutional-auth/schemas/institutional-register.schema";
import { setInstitutionalRegistrationSuccessCookie } from "@features/institutional-auth/utils/institutional-auth-cookies.util";
import type { InstitutionalRegisterActionState } from "@features/institutional-auth/types/institutional-register-state.types";
import { INSTITUTIONAL_REGISTER_FIELD_NAMES } from "@features/institutional-auth/types/institutional-register-state.types";

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
    password: formData.get("password") ?? "",
    confirmPassword: formData.get("confirmPassword") ?? "",
  });

  if (!parsed.success) {
    return { fieldErrors: getFieldErrors(parsed.error.issues, INSTITUTIONAL_REGISTER_FIELD_NAMES) };
  }

  const input = {
    institutionId: parsed.data.institutionId,
    name: parsed.data.name,
    lastName: parsed.data.lastName,
    birthDate: parsed.data.birthDate,
    documentNumber: parsed.data.documentNumber,
    password: parsed.data.password,
  };
  const output = await registerInstitutionalAccount(input);

  if (!output.success) {
    if (output.error.fieldErrors) {
      return { fieldErrors: pickFieldErrors(output.error.fieldErrors, INSTITUTIONAL_REGISTER_FIELD_NAMES) };
    }

    return { error: output.error.message || INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_FORM };
  }

  await setInstitutionalRegistrationSuccessCookie();
  redirect("/auth/login");
}
