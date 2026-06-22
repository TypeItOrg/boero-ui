"use server";

import { institutionalLoginSchema } from "../schemas/institutional-login.schema";
import type { InstitutionalLoginActionState } from "../types/institutional-login-state.types";

export async function loginInstitutional(
  _previousState: InstitutionalLoginActionState,
  formData: FormData,
): Promise<InstitutionalLoginActionState> {
  const parsed = institutionalLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => issue.message);
    const fields = parsed.error.issues
      .map((issue) => issue.path[0])
      .filter(
        (field): field is "email" | "password" =>
          field === "email" || field === "password",
      );

    return {
      error: errors[0] ?? "Revisá los datos ingresados.",
      errors,
      fields,
    };
  }

  return {};
}
