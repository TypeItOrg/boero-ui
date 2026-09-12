"use server";

import { z } from "zod";

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
