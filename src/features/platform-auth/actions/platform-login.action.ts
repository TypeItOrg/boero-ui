"use server";

import { redirect } from "next/navigation";

import { platformLoginSchema } from "@features/platform-auth/schemas/platform-login.schema";
import type { PlatformLoginActionState } from "@features/platform-auth/types/platform-login-action-state.types";
import { loginPlatformAccount } from "@features/platform-auth/services/login-platform-account.service";
import { setPlatformAuthCookies } from "@features/platform-auth/utils/platform-auth-cookies.util";

export async function loginPlatform(
  _previousState: PlatformLoginActionState,
  formData: FormData,
): Promise<PlatformLoginActionState> {
  const parsed = platformLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => issue.message);
    const fields = parsed.error.issues
      .map((issue) => issue.path[0])
      .filter((field): field is "email" | "password" => field === "email" || field === "password");

    return { error: errors[0], errors, fields };
  }

  try {
    const result = await loginPlatformAccount(parsed.data);
    await setPlatformAuthCookies(result.tokens);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Hubo un error al iniciar sesión.",
    };
  }

  redirect("/platform/dashboard");
}
