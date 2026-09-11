"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import { verifyPasskeyAuth } from "@features/institutional-auth/services/passkey-auth-verify.service";
import { setInstitutionalAuthCookies } from "@features/institutional-auth/utils/institutional-auth-cookies.util";
import type { FinishPasskeyLoginState } from "@features/institutional-auth/types/finish-passkey-login-state.types";

const finishPasskeyLoginSchema = z.object({
  loginAttemptId: z.string().min(1),
  ceremonyId: z.string().min(1),
  credentialJson: z.string().min(1),
  rememberMe: z.boolean(),
});

export async function finishPasskeyLogin(input: {
  loginAttemptId: string;
  ceremonyId: string;
  credentialJson: string;
  rememberMe: boolean;
}): Promise<FinishPasskeyLoginState> {
  const parsed = finishPasskeyLoginSchema.safeParse(input);

  if (!parsed.success) {
    return { error: INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSKEY_FAILED };
  }

  let credential: unknown;

  try {
    credential = JSON.parse(parsed.data.credentialJson) as unknown;
  } catch {
    return { error: INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSKEY_FAILED };
  }

  const output = await verifyPasskeyAuth(
    {
      loginAttemptId: parsed.data.loginAttemptId,
      ceremonyId: parsed.data.ceremonyId,
      credential,
      rememberMe: parsed.data.rememberMe,
    },
    await headers(),
  );

  if (!output.success) {
    return { error: output.error.message || INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSKEY_FAILED };
  }

  await setInstitutionalAuthCookies(output.data.tokens, parsed.data.rememberMe);
  redirect("/");
}
