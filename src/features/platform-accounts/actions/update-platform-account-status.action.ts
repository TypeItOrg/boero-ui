"use server";

import { revalidatePath } from "next/cache";

import { getResponseErrorActionState } from "@common/utils/action-state.util";
import { PLATFORM_ACCOUNT_ERROR_MESSAGES } from "@features/platform-accounts/constants/error-messages.constants";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

type UpdatePlatformAccountStatusState = {
  success?: boolean;
  error?: string;
};

const PLATFORM_ACCOUNTS_PATH = "/platform/accounts";

export async function updatePlatformAccountStatusAction(
  id: string,
  enabled: boolean,
): Promise<UpdatePlatformAccountStatusState> {
  const errorState = await getResponseErrorActionState(
    platformApiFetch(`/api/v1/platform/accounts/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    }),
    [],
    PLATFORM_ACCOUNT_ERROR_MESSAGES.UPDATE_STATUS(enabled),
  );
  if (errorState) return errorState;

  revalidatePath(PLATFORM_ACCOUNTS_PATH);
  revalidatePath(`${PLATFORM_ACCOUNTS_PATH}/${id}`);
  return { success: true };
}
