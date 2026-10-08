"use server";

import { revalidatePath } from "next/cache";
import { INVALID_ACTION_ARGUMENTS, isValidUuid } from "@common/utils/action-argument.util";
import { getResponseErrorActionState } from "@common/utils/action-state.util";
import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import { getPlatformAccount } from "@features/platform-auth/services/get-platform-account.service";
import type { InstitutionPublicAccessState } from "@features/institutions/types/institution-public-access-state.types";

export async function updateInstitutionPublicAccess(
  institutionId: string,
  _previous: InstitutionPublicAccessState,
  formData: FormData,
): Promise<InstitutionPublicAccessState> {
  if (!isValidUuid(institutionId)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }
  let account;
  try {
    account = await getPlatformAccount();
  } catch {
    return { error: INSTITUTION_ERROR_MESSAGES.PUBLIC_ACCESS_UPDATE };
  }
  if (!account) {
    return { error: INSTITUTION_ERROR_MESSAGES.LOGO_FORBIDDEN };
  }

  const value = formData.get("publicSubdomain");
  if (typeof value !== "string" || (value !== "" && !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(value))) {
    return { fieldErrors: { publicSubdomain: INSTITUTION_ERROR_MESSAGES.PUBLIC_ACCESS_INVALID } };
  }

  const error = await getResponseErrorActionState(
    platformApiFetch(`/api/v1/admin/institutions/${institutionId}/public-access`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicSubdomain: value || null }),
    }),
    ["publicSubdomain"],
    INSTITUTION_ERROR_MESSAGES.PUBLIC_ACCESS_UPDATE,
  );
  if (error) {
    return error;
  }

  revalidatePath(`/admin/institutions/${institutionId}`);
  return { success: true };
}
