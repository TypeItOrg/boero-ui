"use server";

import { redirect } from "next/navigation";

import { loginPlatformAccount, setPlatformAuthCookies } from "@/lib/platform-auth";
import { platformLoginSchema, type PlatformLoginActionState } from "./schema";

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

    return {
      error: errors[0] ?? "Revisá los datos ingresados.",
      errors,
      fields,
    };
  }

  try {
    const result = await loginPlatformAccount(parsed.data);
    await setPlatformAuthCookies(result.tokens);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No pudimos iniciar sesión.",
    };
  }

  redirect("/platform/dashboard");
}
