"use server";

import { revalidatePath } from "next/cache";
import { getResponseErrorActionState } from "@common/utils/action-state.util";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import { peopleApiFetch } from "../services/people-api-fetch.service";
import type { PeopleScope } from "../utils/people-scope.util";
import { getPeoplePath } from "../utils/people-scope.util";

type DeletePersonActionState = {
  success?: boolean;
  error?: string;
};

export async function deletePersonAction(
  institutionId: string,
  personId: string,
  scope: PeopleScope = "admin",
): Promise<DeletePersonActionState> {
  const errorState = await getResponseErrorActionState(
    peopleApiFetch(scope, getPeoplePath(scope, institutionId, personId), { method: "DELETE" }),
    [],
    PEOPLE_ERROR_MESSAGES.DELETE_PERSON,
  );
  if (errorState) return errorState;

  revalidatePath(scope === "institutional" ? "/people" : `/admin/institutions/${institutionId}/people`);
  revalidatePath(
    scope === "institutional" ? `/people/${personId}` : `/admin/institutions/${institutionId}/people/${personId}`,
  );
  revalidatePath("/admin/people");
  return { success: true };
}
