"use server";

import { revalidatePath } from "next/cache";

import { getResponseErrorActionState } from "@common/utils/action-state.util";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import { peopleApiFetch } from "@features/people/services/people-api-fetch.service";
import { PeopleScope } from "@features/people/utils/people-scope.util";

type UpdatePersonStatusActionState = {
  success?: boolean;
  error?: string;
};

export async function updatePersonStatusAction(
  institutionId: string,
  personId: string,
  enabled: boolean,
): Promise<UpdatePersonStatusActionState> {
  const errorState = await getResponseErrorActionState(
    peopleApiFetch(PeopleScope.INSTITUTIONAL, `/api/v1/institutions/${institutionId}/people/${personId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    }),
    [],
    PEOPLE_ERROR_MESSAGES.UPDATE_STATUS,
  );
  if (errorState) return errorState;

  revalidatePath("/people");
  revalidatePath(`/people/${personId}`);
  return { success: true };
}
