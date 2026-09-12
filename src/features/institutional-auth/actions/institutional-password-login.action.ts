"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import { passwordLoginInstitutionalAccount } from "@features/institutional-auth/services/password-login-institutional.service";
import { setInstitutionalAuthCookies } from "@features/institutional-auth/utils/institutional-auth-cookies.util";
import type { InstitutionalPasswordLoginActionState } from "@features/institutional-auth/types/institutional-password-login-state.types";

const boundArgsSchema = z.object({
  loginAttemptId: z.string().min(1),
});

export async function institutionalPasswordLogin(
  loginAttemptId: string,
  _previousState: InstitutionalPasswordLoginActionState,
  formData: FormData,
): Promise<InstitutionalPasswordLoginActionState> {
  const bound = boundArgsSchema.safeParse({ loginAttemptId });

  if (!bound.success) {
    return { error: INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_FORM };
  }

  const rawRememberMe = formData.get("rememberMe");

  if (rawRememberMe !== null && rawRememberMe !== "on") {
    return { error: INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_FORM };
  }

  const password = formData.get("password") ?? "";

  if (typeof password !== "string" || password.length === 0) {
    return { fieldErrors: { password: INSTITUTIONAL_AUTH_ERROR_MESSAGES.REQUIRED_PASSWORD } };
  }

  const rememberMe = rawRememberMe === "on";
  const output = await passwordLoginInstitutionalAccount({ loginAttemptId: bound.data.loginAttemptId, password, rememberMe }, await headers());

  if (!output.success) {
    return { error: output.error.message || INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS };
  }

  await setInstitutionalAuthCookies(output.data.tokens, rememberMe);
  redirect("/");
}
