"use server";

import { revalidatePath } from "next/cache";

import { getFieldErrors } from "@common/utils/form-field-errors.util";
import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import { RECENT_AUTH_REQUIRED } from "@features/institutional-auth/constants/passkey.constants";
import { requestPasskeyRegistrationOptions } from "@features/institutional-auth/services/passkey-registration-options.service";
import { verifyPasskeyRegistration } from "@features/institutional-auth/services/passkey-registration-verify.service";
import { passkeyLabelSchema } from "@features/institutional-auth/schemas/passkey-label.schema";
import type { RequestPasskeyRegistrationState } from "@features/institutional-auth/types/request-passkey-registration-state.types";
import type { VerifyPasskeyRegistrationState } from "@features/institutional-auth/types/verify-passkey-registration-state.types";

const LABEL_FIELD_NAMES = ["label"] as const;

export async function requestPasskeyRegistration(
  _previousState: RequestPasskeyRegistrationState,
  formData: FormData,
): Promise<RequestPasskeyRegistrationState> {
  const parsed = passkeyLabelSchema.safeParse({ label: formData.get("label") ?? "" });

  if (!parsed.success) {
    return { fieldErrors: getFieldErrors(parsed.error.issues, LABEL_FIELD_NAMES) };
  }

  try {
    const data = await requestPasskeyRegistrationOptions(parsed.data.label);
    return { ceremonyId: data.ceremonyId, options: data.options };
  } catch (error) {
    if (error instanceof Error && error.message === RECENT_AUTH_REQUIRED) {
      return { error: RECENT_AUTH_REQUIRED };
    }

    return { error: INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSKEY_REGISTRATION_START_FAILED };
  }
}

export async function verifyPasskeyRegistrationAction(ceremonyId: string, credential: unknown): Promise<VerifyPasskeyRegistrationState> {
  if (!ceremonyId) {
    return { error: INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSKEY_REGISTRATION_FAILED };
  }

  try {
    await verifyPasskeyRegistration(ceremonyId, credential);
  } catch (error) {
    if (error instanceof Error && error.message === RECENT_AUTH_REQUIRED) {
      return { error: RECENT_AUTH_REQUIRED };
    }

    return { error: INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSKEY_REGISTRATION_FAILED };
  }

  revalidatePath("/account/passkeys");
  return {};
}
