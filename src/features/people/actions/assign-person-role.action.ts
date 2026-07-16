"use server";

import { revalidatePath } from "next/cache";

import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import { personRoleSchema } from "@features/people/schemas/person-role.schema";
import { ROLE_FORM_FIELD_NAMES, type RoleActionState } from "@features/people/types/role-action-state.types";
import type { SystemRoleCode } from "@features/people/types/person-role.types";

const INSTITUTIONAL_AUTHORITY_ROLE: SystemRoleCode = "INSTITUTIONAL_AUTHORITY";

export async function assignPersonRoleAction(
  institutionId: string,
  personId: string,
  role: string,
): Promise<RoleActionState> {
  const parsed = personRoleSchema.safeParse({ role });
  if (!parsed.success) {
    return getValidationActionState(parsed.error.issues, ROLE_FORM_FIELD_NAMES);
  }

  const path = getAssignRolePath(institutionId, personId, parsed.data.role);

  const response = platformApiFetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: getAssignRoleBody(parsed.data.role),
  });

  const errorState = await getResponseErrorActionState(
    response,
    ROLE_FORM_FIELD_NAMES,
    PEOPLE_ERROR_MESSAGES.ASSIGN_ROLE,
  );
  if (errorState) return errorState;

  revalidatePath(`/platform/institutions/${institutionId}/people/${personId}`);
  return { success: true };
}

function getAssignRolePath(institutionId: string, personId: string, role: SystemRoleCode): string {
  if (role === INSTITUTIONAL_AUTHORITY_ROLE) {
    return `/api/v1/platform/institutions/${institutionId}/authority/${personId}`;
  }

  return `/api/v1/institutions/${institutionId}/people/${personId}/roles`;
}

function getAssignRoleBody(role: SystemRoleCode): string | undefined {
  if (role === INSTITUTIONAL_AUTHORITY_ROLE) return undefined;

  return JSON.stringify({ role });
}
