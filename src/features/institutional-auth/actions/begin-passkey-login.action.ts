"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { validateRequestInstitutionId } from "@common/services/institutional-host/institutional-host.service";
import { getFieldErrors } from "@common/utils/form-field-errors.util";
import { institutionalPasskeyLoginSchema } from "@features/institutional-auth/schemas/institutional-passkey-login.schema";
import { identifyInstitutionalAccount } from "@features/institutional-auth/services/identify-institutional.service";
import { requestDiscoverablePasskeyAuthOptions } from "@features/institutional-auth/services/passkey-auth-options.service";
import type { InstitutionalPasskeyLoginInput } from "@features/institutional-auth/types/institutional-passkey-login-input.types";

import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import { requestPasskeyAuthOptions } from "@features/institutional-auth/services/passkey-auth-options.service";
import type { BeginPasskeyLoginState } from "@features/institutional-auth/types/begin-passkey-login-state.types";

const boundArgsSchema = z.object({
  loginAttemptId: z.string().min(1),
});

export async function beginPasskeyLogin(loginAttemptId: string): Promise<BeginPasskeyLoginState> {
  const bound = boundArgsSchema.safeParse({ loginAttemptId });

  if (!bound.success) {
    return { error: INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_FORM };
  }

  const output = await requestPasskeyAuthOptions(bound.data.loginAttemptId);

  if (!output.success) {
    return { error: output.error.message || INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSKEY_FAILED };
  }

  return { ceremonyId: output.data.ceremonyId, options: output.data.options };
}

export async function beginInstitutionalPasskeyLogin(input: InstitutionalPasskeyLoginInput): Promise<BeginPasskeyLoginState> {
  const parsed = institutionalPasskeyLoginSchema.safeParse(input);
  if (!parsed.success) {
    return { fieldErrors: getFieldErrors(parsed.error.issues, ["institutionId", "documentNumber"]) };
  }
  const contextError = await validateRequestInstitutionId(parsed.data.institutionId);
  if (contextError) {
    return { error: contextError };
  }

  if (parsed.data.documentNumber) {
    const identified = await identifyInstitutionalAccount(
      { institutionId: parsed.data.institutionId, documentNumber: parsed.data.documentNumber },
      await headers(),
    );
    if (!identified.success) {
      return {
        error:
          identified.error.status === 404
            ? INSTITUTIONAL_AUTH_ERROR_MESSAGES.ACCOUNT_NOT_FOUND
            : identified.error.message || INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSKEY_FAILED,
      };
    }
    if (identified.data.nextStep === "EMAIL_VERIFICATION") {
      // Return, rather than redirect, until the client confirms this request is still current.
      return { emailVerificationRequired: true };
    }
    if (identified.data.nextStep !== "PASSKEY") {
      return { error: INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSKEY_ACCOUNT_UNAVAILABLE };
    }
    const started = await beginPasskeyLogin(identified.data.loginAttemptId);
    return { ...started, loginAttemptId: identified.data.loginAttemptId };
  }

  const output = await requestDiscoverablePasskeyAuthOptions(parsed.data.institutionId);
  if (!output.success) {
    return { error: output.error.message || INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSKEY_FAILED };
  }
  return { ceremonyId: output.data.ceremonyId, options: output.data.options };
}
