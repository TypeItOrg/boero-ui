"use server";

import { revalidatePath } from "next/cache";
import { getResponseErrorActionState } from "@common/utils/action-state.util";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

type DeletePersonActionState = {
  success?: boolean;
  error?: string;
};

export async function deletePersonAction(institutionId: string, personId: string): Promise<DeletePersonActionState> {
  const errorState = await getResponseErrorActionState(
    platformApiFetch(`/api/v1/admin/institutions/${institutionId}/people/${personId}`, { method: "DELETE" }),
    [],
    PEOPLE_ERROR_MESSAGES.DELETE_PERSON,
  );
  if (errorState) return errorState;

  revalidatePath(`/admin/institutions/${institutionId}/people`);
  revalidatePath(`/admin/institutions/${institutionId}/people/${personId}`);
  revalidatePath("/admin/people");
  return { success: true };
}
