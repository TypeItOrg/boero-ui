"use server";

import { revalidatePath } from "next/cache";
import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import { assignPersonRoleAction } from "@features/people/actions/assign-person-role.action";
import { revokePersonRoleAction } from "@features/people/actions/revoke-person-role.action";
import { personRoleIdsSchema } from "@features/people/schemas/person-role.schema";
import { updatePersonFormSchema } from "@features/people/schemas/person-form.schema";
import { fetchPersonRoles } from "@features/people/services/fetch-person-roles.service";
import { peopleApiFetch } from "@features/people/services/people-api-fetch.service";
import { PERSON_FORM_FIELD_NAMES, type PersonActionState } from "@features/people/types/person-action-state.types";
import { getRoleChanges, type PersonRoleChanges } from "@features/people/utils/person-role-rules.util";
import type { PeopleScope } from "@features/people/utils/people-scope.util";
import { getPeoplePath } from "@features/people/utils/people-scope.util";

export async function updatePersonAction(
  institutionId: string,
  personId: string,
  formData: FormData,
  scope: PeopleScope = "admin",
): Promise<PersonActionState> {
  const roleIds = parseRoleIds(formData.get("roleIds"));
  if (roleIds === null) {
    return { error: PEOPLE_ERROR_MESSAGES.INVALID_ROLE_CONFIGURATION };
  }

  if (formData.has("firstName")) {
    const payload = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email") || "",
      phoneNumber: formData.get("phoneNumber") || "",
    };

    const parsed = updatePersonFormSchema.safeParse(payload);
    if (!parsed.success) {
      return getValidationActionState(parsed.error.issues, PERSON_FORM_FIELD_NAMES);
    }

    const errorState = await getResponseErrorActionState(
      peopleApiFetch(scope, getPeoplePath(scope, institutionId, personId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      }),
      PERSON_FORM_FIELD_NAMES,
      PEOPLE_ERROR_MESSAGES.UPDATE_PERSON,
    );
    if (errorState) return errorState;
  }

  if (roleIds) {
    const roleChanges = await prepareRoleChanges(institutionId, personId, roleIds, scope);
    if (typeof roleChanges === "string") {
      revalidatePersonPaths(institutionId, personId, scope);
      return { error: roleChanges };
    }

    const roleError = await syncPersonRoles(institutionId, personId, roleChanges, scope);
    if (roleError) {
      revalidatePersonPaths(institutionId, personId, scope);
      return { error: roleError };
    }
  }

  revalidatePersonPaths(institutionId, personId, scope);
  return { success: true };
}

function parseRoleIds(value: FormDataEntryValue | null): string[] | null | undefined {
  if (value === null || typeof value !== "string") return undefined;

  try {
    const parsed = personRoleIdsSchema.safeParse(JSON.parse(value));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

async function prepareRoleChanges(
  institutionId: string,
  personId: string,
  desiredRoleCodes: readonly string[],
  scope: PeopleScope,
): Promise<PersonRoleChanges | string> {
  try {
    const currentRoles = await fetchPersonRoles(institutionId, personId, scope);

    return getRoleChanges(
      currentRoles.map((role) => role.roleId),
      desiredRoleCodes,
    );
  } catch {
    return PEOPLE_ERROR_MESSAGES.VERIFY_ROLE;
  }
}

async function syncPersonRoles(
  institutionId: string,
  personId: string,
  roleChanges: PersonRoleChanges,
  scope: PeopleScope,
): Promise<string | undefined> {
  for (const roleCode of roleChanges.assignments) {
    const result = await assignPersonRoleAction(institutionId, personId, roleCode, scope);
    if (!result.success) {
      return result.error ?? PEOPLE_ERROR_MESSAGES.ASSIGN_SELECTED_ROLE;
    }
  }

  for (const roleCode of roleChanges.revocations) {
    const result = await revokePersonRoleAction(institutionId, personId, roleCode, scope);
    if (!result.success) {
      return result.error ?? PEOPLE_ERROR_MESSAGES.REVOKE_SELECTED_ROLE;
    }
  }

  return undefined;
}

function revalidatePersonPaths(institutionId: string, personId: string, scope: PeopleScope): void {
  revalidatePath(scope === "institutional" ? "/people" : `/admin/institutions/${institutionId}/people`);
  revalidatePath(
    scope === "institutional" ? `/people/${personId}` : `/admin/institutions/${institutionId}/people/${personId}`,
  );
}
