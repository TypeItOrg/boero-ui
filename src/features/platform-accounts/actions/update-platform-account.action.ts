"use server";

import { revalidatePath } from "next/cache";

import { INVALID_ACTION_ARGUMENTS, isValidUuid } from "@common/utils/action-argument.util";
import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { PLATFORM_ACCOUNT_ERROR_MESSAGES } from "@features/platform-accounts/constants/error-messages.constants";
import { platformAccountUpdateFormSchema } from "@features/platform-accounts/schemas/platform-account-form.schema";
import { type PlatformAccountActionState } from "@features/platform-accounts/types/platform-account-action-state.types";
import { PLATFORM_ACCOUNT_FORM_FIELD_NAMES } from "@features/platform-accounts/types/platform-account-form-field-name.types";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

const PLATFORM_ACCOUNTS_PATH = "/admin/accounts";

export async function updatePlatformAccountAction(id: string, formData: FormData): Promise<PlatformAccountActionState> {
  if (!isValidUuid(id)) return { error: INVALID_ACTION_ARGUMENTS };

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

  const response = platformApiFetch(`/api/v1/admin/accounts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: parsed.data.name,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      ...(parsed.data.password ? { password: parsed.data.password } : {}),
    }),
  });

  const errorState = await getResponseErrorActionState(
    response,
    PLATFORM_ACCOUNT_FORM_FIELD_NAMES,
    PLATFORM_ACCOUNT_ERROR_MESSAGES.UPDATE_ACCOUNT,
  );
  if (errorState) return errorState;

  revalidatePath(PLATFORM_ACCOUNTS_PATH);
  revalidatePath(`${PLATFORM_ACCOUNTS_PATH}/${id}`);
  revalidatePath(`${PLATFORM_ACCOUNTS_PATH}/${id}/edit`);
  return { success: true };
}
