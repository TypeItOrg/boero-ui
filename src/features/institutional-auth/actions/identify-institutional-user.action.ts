"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { setEmailVerificationContext } from "@features/institutional-auth/utils/email-verification-context.util";

import { getFieldErrors } from "@common/utils/form-field-errors.util";
import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import { emailVerificationContextSchema } from "@features/institutional-auth/schemas/email-verification.schema";
import { institutionalIdentifySchema } from "@features/institutional-auth/schemas/institutional-identify.schema";
import { identifyInstitutionalAccount } from "@features/institutional-auth/services/identify-institutional.service";
import type { InstitutionalIdentifyActionState } from "@features/institutional-auth/types/institutional-identify-state.types";
import { INSTITUTIONAL_IDENTIFY_FIELD_NAMES } from "@features/institutional-auth/types/institutional-identify-state.types";

export async function identifyInstitutionalUser(
  _previousState: InstitutionalIdentifyActionState,
  formData: FormData,
): Promise<InstitutionalIdentifyActionState> {
  const parsed = institutionalIdentifySchema.safeParse({
    institutionId: formData.get("institutionId") ?? "",
    documentNumber: formData.get("documentNumber") ?? "",
  });

  if (!parsed.success) {
    return { fieldErrors: getFieldErrors(parsed.error.issues, INSTITUTIONAL_IDENTIFY_FIELD_NAMES) };
  }

  const output = await identifyInstitutionalAccount(parsed.data, await headers());

  if (!output.success) {
    if (output.error.status === 404) {
      return { error: INSTITUTIONAL_AUTH_ERROR_MESSAGES.ACCOUNT_NOT_FOUND };
    }

    return { error: output.error.message || INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_FORM };
  }

  if (output.data.nextStep === "EMAIL_VERIFICATION") {
    const context = emailVerificationContextSchema.safeParse({
      ...parsed.data,
      institutionName: formData.get("institutionName") || undefined,
    });
    await setEmailVerificationContext(context.success ? context.data : parsed.data);
    redirect("/auth/email-verification");
  }
  return { loginAttemptId: output.data.loginAttemptId, nextStep: output.data.nextStep };
}
