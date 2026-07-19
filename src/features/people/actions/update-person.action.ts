"use server";

import { revalidatePath } from "next/cache";
import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { getInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import { assignPersonRoleAction } from "./assign-person-role.action";
import { revokePersonRoleAction } from "./revoke-person-role.action";
import { personRoleIdsSchema } from "../schemas/person-role.schema";
import { updatePersonFormSchema } from "../schemas/person-form.schema";
import { fetchPersonRoles } from "../services/fetch-person-roles.service";
import { peopleApiFetch } from "../services/people-api-fetch.service";
import { PERSON_FORM_FIELD_NAMES, type PersonActionState } from "../types/person-action-state.types";
import { getRoleChanges, type PersonRoleChanges } from "../utils/person-role-rules.util";
import type { PeopleScope } from "../utils/people-scope.util";
import { getPeoplePath } from "../utils/people-scope.util";

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

  const roleChanges = roleIds ? await prepareRoleChanges(institutionId, personId, roleIds, scope) : undefined;
  if (typeof roleChanges === "string") {
    return { error: roleChanges };
  }

  const response = peopleApiFetch(scope, getPeoplePath(scope, institutionId, personId), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parsed.data),
  });

  const errorState = await getResponseErrorActionState(
    response,
    PERSON_FORM_FIELD_NAMES,
    PEOPLE_ERROR_MESSAGES.UPDATE_PERSON,
  );
  if (errorState) return errorState;

  if (roleChanges) {
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
  let currentRoles;

  try {
    currentRoles = await fetchPersonRoles(institutionId, personId, scope);
  } catch {
    return PEOPLE_ERROR_MESSAGES.VERIFY_ROLE;
  }

  const roleChanges = getRoleChanges(
    currentRoles.map((role) => role.roleId),
    desiredRoleCodes,
  );

  if (scope === "institutional" && !(await canApplyRoleChanges(institutionId, roleChanges))) {
    return PEOPLE_ERROR_MESSAGES.UNAUTHORIZED_ROLE_CHANGE;
  }

  return roleChanges;
}

async function canApplyRoleChanges(institutionId: string, roleChanges: PersonRoleChanges): Promise<boolean> {
  const user = await getInstitutionalUser();
  if (!user || user.institutionId !== institutionId) return false;

  const canAssign =
    roleChanges.assignments.length === 0 || hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ROLE_ASSIGN);
  const canRevoke =
    roleChanges.revocations.length === 0 || hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ROLE_REVOKE);

  return canAssign && canRevoke;
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
