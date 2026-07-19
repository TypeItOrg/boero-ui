"use server";

import { revalidatePath } from "next/cache";

import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import { personRoleSchema } from "@features/people/schemas/person-role.schema";
import { ROLE_FORM_FIELD_NAMES, type RoleActionState } from "@features/people/types/role-action-state.types";
import { peopleApiFetch } from "../services/people-api-fetch.service";
import type { PeopleScope } from "../utils/people-scope.util";

export async function assignPersonRoleAction(
  institutionId: string,
  personId: string,
  role: string,
  scope: PeopleScope = "admin",
): Promise<RoleActionState> {
  const parsed = personRoleSchema.safeParse({ role });
  if (!parsed.success) {
    return getValidationActionState(parsed.error.issues, ROLE_FORM_FIELD_NAMES);
  }

  const path = getAssignRolePath(institutionId, personId, scope);

  const response = peopleApiFetch(scope, path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ roleId: parsed.data.role }),
  });

  const errorState = await getResponseErrorActionState(
    response,
    ROLE_FORM_FIELD_NAMES,
    PEOPLE_ERROR_MESSAGES.ASSIGN_ROLE,
  );
  if (errorState) return errorState;

  revalidatePath(
    scope === "institutional" ? `/people/${personId}` : `/admin/institutions/${institutionId}/people/${personId}`,
  );
  return { success: true };
}

function getAssignRolePath(institutionId: string, personId: string, scope: PeopleScope): string {
  if (scope === "institutional") return `/api/v1/institutions/${institutionId}/people/${personId}/roles`;
  return `/api/v1/admin/institutions/${institutionId}/people/${personId}/roles`;
}
