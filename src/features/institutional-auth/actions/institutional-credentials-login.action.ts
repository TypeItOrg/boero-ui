"use server";

import { z } from "zod";
import { getFieldErrors } from "@common/utils/form-field-errors.util";
import { identifyInstitutionalUser } from "@features/institutional-auth/actions/identify-institutional-user.action";
import { institutionalPasswordLogin } from "@features/institutional-auth/actions/institutional-password-login.action";
import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import { institutionalIdentifySchema } from "@features/institutional-auth/schemas/institutional-identify.schema";
import type { InstitutionalCredentialsLoginState } from "@features/institutional-auth/types/institutional-credentials-login-state.types";

const schema = institutionalIdentifySchema.extend({
  password: z.string().min(1, INSTITUTIONAL_AUTH_ERROR_MESSAGES.REQUIRED_PASSWORD),
  rememberMe: z.literal("on").nullable(),
});

export async function institutionalCredentialsLogin(
  _previous: InstitutionalCredentialsLoginState,
  formData: FormData,
): Promise<InstitutionalCredentialsLoginState> {
  const parsed = schema.safeParse({
    institutionId: formData.get("institutionId"),
    documentNumber: formData.get("documentNumber"),
    password: formData.get("password"),
    rememberMe: formData.get("rememberMe"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: getFieldErrors(parsed.error.issues, ["institutionId", "documentNumber", "password"]),
      error: parsed.error.issues.some((issue) => issue.path[0] === "rememberMe") ? INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_FORM : undefined,
    };
  }

  // Identification stays internal; a PASSKEY preference must not override the chosen method.
  const identified = await identifyInstitutionalUser({}, formData);
  if (!identified.loginAttemptId) {
    return identified;
  }

  return institutionalPasswordLogin(identified.loginAttemptId, {}, formData);
}
