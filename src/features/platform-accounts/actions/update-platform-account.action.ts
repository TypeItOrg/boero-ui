"use server";

import { revalidatePath } from "next/cache";

import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { platformAccountUpdateFormSchema } from "@features/platform-accounts/schemas/platform-account-form.schema";
import {
  PLATFORM_ACCOUNT_FORM_FIELD_NAMES,
  type PlatformAccountActionState,
} from "@features/platform-accounts/types/platform-account-action-state.types";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

const PLATFORM_ACCOUNTS_PATH = "/platform/accounts";

export async function updatePlatformAccountAction(id: string, formData: FormData): Promise<PlatformAccountActionState> {
  const parsed = platformAccountUpdateFormSchema.safeParse({
    name: formData.get("name"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return getValidationActionState(parsed.error.issues, PLATFORM_ACCOUNT_FORM_FIELD_NAMES);
  }

  const response = await platformApiFetch(`/api/v1/platform/accounts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: parsed.data.name,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      ...(parsed.data.password ? { password: parsed.data.password } : {}),
    }),
  });

  if (!response.ok) {
    return getResponseErrorActionState(
      response,
      PLATFORM_ACCOUNT_FORM_FIELD_NAMES,
      "No se pudo actualizar el administrador.",
    );
  }

  revalidatePath(PLATFORM_ACCOUNTS_PATH);
  revalidatePath(`${PLATFORM_ACCOUNTS_PATH}/${id}`);
  revalidatePath(`${PLATFORM_ACCOUNTS_PATH}/${id}/edit`);
  return { success: true };
}
