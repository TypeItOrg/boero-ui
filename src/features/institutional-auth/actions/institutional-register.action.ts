"use server";

import { institutionalRegisterSchema } from "../schemas/institutional-register.schema";
import type { InstitutionalRegisterActionState } from "../types/institutional-register-state.types";

export async function registerInstitutional(
  _previousState: InstitutionalRegisterActionState,
  formData: FormData,
): Promise<InstitutionalRegisterActionState> {
  const parsed = institutionalRegisterSchema.safeParse({
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

  return {};
}
