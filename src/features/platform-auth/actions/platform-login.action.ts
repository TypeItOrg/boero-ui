"use server";

import { getFieldErrors, pickFieldErrors } from "@common/utils/form-field-errors.util";

import { platformLoginSchema } from "@features/platform-auth/schemas/platform-login.schema";
import type { PlatformLoginActionState } from "@features/platform-auth/types/platform-login-action-state.types";
import { PLATFORM_LOGIN_FIELD_NAMES } from "@features/platform-auth/types/platform-login-field-name.types";
import { loginPlatformAccount } from "@features/platform-auth/services/login-platform-account.service";
import { setPlatformAuthCookies } from "@features/platform-auth/utils/platform-auth-cookies.util";
import { redirectToNext } from "@features/platform-auth/utils/platform-auth-redirect.util";

export async function loginPlatform(_previousState: PlatformLoginActionState, formData: FormData): Promise<PlatformLoginActionState> {
  const parsed = platformLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: getFieldErrors(parsed.error.issues, PLATFORM_LOGIN_FIELD_NAMES),
    };
  }

  const output = await loginPlatformAccount(parsed.data);

  if (!output.success) {
    if (output.error.fieldErrors) {
      return {
        fieldErrors: pickFieldErrors(output.error.fieldErrors, PLATFORM_LOGIN_FIELD_NAMES),
      };
    }

    return { error: output.error.message };
  }

  await setPlatformAuthCookies(output.data.tokens);
  redirectToNext(formData.get("next") as string | null);
}
