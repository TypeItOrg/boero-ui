"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getFieldErrors, pickFieldErrors } from "@common/utils/form-field-errors.util";
import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import { loginInstitutionalAccount } from "@features/institutional-auth/services/login-institutional.service";
import {
  clearInstitutionalPasswordChangedCookie,
  clearInstitutionalRegistrationSuccessCookie,
  setInstitutionalAuthCookies,
} from "@features/institutional-auth/utils/institutional-auth-cookies.util";
import { institutionalLoginSchema } from "@features/institutional-auth/schemas/institutional-login.schema";
import type { InstitutionalLoginActionState } from "@features/institutional-auth/types/institutional-login-state.types";
import { INSTITUTIONAL_LOGIN_FIELD_NAMES } from "@features/institutional-auth/types/institutional-login-state.types";

export async function loginInstitutional(_previousState: InstitutionalLoginActionState, formData: FormData): Promise<InstitutionalLoginActionState> {
  await clearInstitutionalRegistrationSuccessCookie();
  await clearInstitutionalPasswordChangedCookie();

  const parsed = institutionalLoginSchema.safeParse({
    institutionId: formData.get("institutionId") ?? "",
    documentNumber: formData.get("documentNumber") ?? "",
    password: formData.get("password") ?? "",
    rememberMe: formData.get("rememberMe") === "on",
  });

  if (!parsed.success) {
    return { fieldErrors: getFieldErrors(parsed.error.issues, INSTITUTIONAL_LOGIN_FIELD_NAMES) };
  }

  const output = await loginInstitutionalAccount(parsed.data, await headers());

  if (!output.success) {
    if (output.error.fieldErrors) {
      return { fieldErrors: pickFieldErrors(output.error.fieldErrors, INSTITUTIONAL_LOGIN_FIELD_NAMES) };
    }

    return { error: output.error.message || INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_FORM };
  }

  await setInstitutionalAuthCookies(output.data.tokens, parsed.data.rememberMe);
  redirect("/");
}
