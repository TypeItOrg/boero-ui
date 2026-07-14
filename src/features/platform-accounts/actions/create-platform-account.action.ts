"use server";

import { revalidatePath } from "next/cache";

import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { platformAccountFormSchema } from "@features/platform-accounts/schemas/platform-account-form.schema";
import {
  PLATFORM_ACCOUNT_FORM_FIELD_NAMES,
  type PlatformAccountActionState,
} from "@features/platform-accounts/types/platform-account-action-state.types";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

const PLATFORM_ACCOUNTS_PATH = "/platform/accounts";

export async function createPlatformAccountAction(formData: FormData): Promise<PlatformAccountActionState> {
  const parsed = platformAccountFormSchema.safeParse({
    name: formData.get("name"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return getValidationActionState(parsed.error.issues, PLATFORM_ACCOUNT_FORM_FIELD_NAMES);
  }

  const payload = {
    name: parsed.data.name,
    lastName: parsed.data.lastName,
    email: parsed.data.email,
    password: parsed.data.password,
  };
  const response = await platformApiFetch("/api/v1/platform/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return getResponseErrorActionState(
      response,
      PLATFORM_ACCOUNT_FORM_FIELD_NAMES,
      "No se pudo crear el administrador.",
    );
  }

  revalidatePath(PLATFORM_ACCOUNTS_PATH);
  return { success: true };
}
