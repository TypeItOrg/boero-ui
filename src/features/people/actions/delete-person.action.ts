"use server";

import { revalidatePath } from "next/cache";
import { INVALID_ACTION_ARGUMENTS, isValidUuid } from "@common/utils/action-argument.util";
import { getResponseErrorActionState } from "@common/utils/action-state.util";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import { peopleApiFetch } from "@features/people/services/people-api-fetch.service";
import {
  getPeoplePath,
  PeopleScope,
  type PeopleScope as PeopleScopeType,
} from "@features/people/utils/people-scope.util";

type DeletePersonActionState = {
  success?: boolean;
  error?: string;
};

export async function deletePersonAction(
  institutionId: string,
  personId: string,
  scope: PeopleScopeType = PeopleScope.ADMIN,
): Promise<DeletePersonActionState> {
  if (
    !isValidUuid(institutionId) ||
    !isValidUuid(personId) ||
    (!PeopleScope.isAdmin(scope) && !PeopleScope.isInstitutional(scope))
  ) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const errorState = await getResponseErrorActionState(
    peopleApiFetch(scope, getPeoplePath(scope, institutionId, personId), { method: "DELETE" }),
    [],
    PEOPLE_ERROR_MESSAGES.DELETE_PERSON,
  );
  if (errorState) return errorState;

  revalidatePath(PeopleScope.isInstitutional(scope) ? "/people" : `/admin/institutions/${institutionId}/people`);
  revalidatePath(
    PeopleScope.isInstitutional(scope)
      ? `/people/${personId}`
      : `/admin/institutions/${institutionId}/people/${personId}`,
  );
  revalidatePath("/admin/people");
  return { success: true };
}
