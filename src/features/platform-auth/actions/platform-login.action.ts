"use server";

import { redirect } from "next/navigation";

import type { ZodIssue } from "zod";

import { platformLoginSchema } from "@features/platform-auth/schemas/platform-login.schema";
import type { PlatformLoginActionState } from "@features/platform-auth/types/platform-login-action-state.types";
import { loginPlatformAccount } from "@features/platform-auth/services/login-platform-account.service";
import { setPlatformAuthCookies } from "@features/platform-auth/utils/platform-auth-cookies.util";

function getFieldErrors(
  issues: ZodIssue[],
): NonNullable<PlatformLoginActionState["fieldErrors"]> {
  const fieldErrors: NonNullable<PlatformLoginActionState["fieldErrors"]> = {};

  for (const issue of issues) {
    const field = issue.path[0];
    if (field === "email" || field === "password") {
      fieldErrors[field] = issue.message;
    }
  }

  return fieldErrors;
}

function pickFieldErrors(
  fieldErrors: Record<string, string> | undefined,
): NonNullable<PlatformLoginActionState["fieldErrors"]> {
  return {
    email: fieldErrors?.email,
    password: fieldErrors?.password,
  };
}

export async function loginPlatform(
  _previousState: PlatformLoginActionState,
  formData: FormData,
): Promise<PlatformLoginActionState> {
  const parsed = platformLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: getFieldErrors(parsed.error.issues) };
  }

  const output = await loginPlatformAccount(parsed.data);

  if (!output.success) {
    if (output.error.fieldErrors) {
      return { fieldErrors: pickFieldErrors(output.error.fieldErrors) };
    }

    return { error: output.error.message };
  }

  await setPlatformAuthCookies(output.data.tokens);

  redirect("/platform/dashboard");
}
