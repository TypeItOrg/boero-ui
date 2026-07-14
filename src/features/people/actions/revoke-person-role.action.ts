"use server";

import { revalidatePath } from "next/cache";
import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
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

  const response = await platformApiFetch(
    `/api/v1/institutions/${institutionId}/people/${personId}/roles/${parsed.data.role}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    return getResponseErrorActionState(response, ROLE_FORM_FIELD_NAMES, "Error al revocar el rol.");
  }

  revalidatePath(`/platform/institutions/${institutionId}/people/${personId}`);
  return { success: true };
}
