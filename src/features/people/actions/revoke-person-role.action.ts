"use server";

import { revalidatePath } from "next/cache";
import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import { personRoleSchema } from "../schemas/person-role.schema";
import { ROLE_FORM_FIELD_NAMES, type RoleActionState } from "../types/role-action-state.types";

export async function revokePersonRoleAction(
  institutionId: string,
  personId: string,
  role: string,
): Promise<RoleActionState> {
  const parsed = personRoleSchema.safeParse({ role });
  if (!parsed.success) {
    return getValidationActionState(parsed.error.issues, ROLE_FORM_FIELD_NAMES);
  }

  const response = platformApiFetch(
    `/api/v1/admin/institutions/${institutionId}/people/${personId}/roles/${parsed.data.role}`,
    {
      method: "DELETE",
    },
  );

  const errorState = await getResponseErrorActionState(
    response,
    ROLE_FORM_FIELD_NAMES,
    PEOPLE_ERROR_MESSAGES.REVOKE_ROLE,
  );
  if (errorState) return errorState;

  revalidatePath(`/admin/institutions/${institutionId}/people/${personId}`);
  return { success: true };
}
