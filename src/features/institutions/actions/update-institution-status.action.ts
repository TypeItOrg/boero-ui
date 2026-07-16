"use server";

import { revalidatePath } from "next/cache";

import { getResponseErrorActionState } from "@common/utils/action-state.util";
import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

type UpdateInstitutionStatusActionState = {
  success?: boolean;
  error?: string;
};

const INSTITUTIONS_PATH = "/admin/institutions";

export async function updateInstitutionStatusAction(
  id: string,
  nextActive: boolean,
): Promise<UpdateInstitutionStatusActionState> {
  const errorState = await getResponseErrorActionState(
    platformApiFetch(`/api/v1/admin/institutions/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ active: nextActive }),
    }),
    [],
    INSTITUTION_ERROR_MESSAGES.UPDATE_STATUS(nextActive),
  );
  if (errorState) return errorState;

  revalidatePath(INSTITUTIONS_PATH);
  revalidatePath(`${INSTITUTIONS_PATH}/${id}`);
  revalidatePath(`${INSTITUTIONS_PATH}/${id}/edit`);
  return { success: true };
}
