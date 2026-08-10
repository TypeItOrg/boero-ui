"use server";

import { revalidatePath } from "next/cache";
import { INVALID_ACTION_ARGUMENTS, isValidUuid } from "@common/utils/action-argument.util";
import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import { personRoleIdsSchema } from "@features/people/schemas/person-role.schema";
import { updatePersonFormSchema } from "@features/people/schemas/person-form.schema";
import { peopleApiFetch } from "@features/people/services/people-api-fetch.service";
import type { PersonActionState } from "@features/people/types/person-action-state.types";
import { PERSON_FORM_FIELD_NAMES } from "@features/people/types/person-form-field-name.types";
import { requirePlatformAccount } from "@features/platform-auth/services/get-platform-account.service";
import {
  getPeoplePath,
  PeopleScope,
  type PeopleScope as PeopleScopeType,
} from "@features/people/utils/people-scope.util";

export async function updateInstitutionalPersonAction(
  institutionId: string,
  personId: string,
  formData: FormData,
): Promise<PersonActionState> {
  await requireInstitutionalUser();
  return updatePersonActionInternal(institutionId, personId, formData, PeopleScope.INSTITUTIONAL);
}

export async function updatePlatformPersonAction(
  institutionId: string,
  personId: string,
  formData: FormData,
): Promise<PersonActionState> {
  await requirePlatformAccount();
  return updatePersonActionInternal(institutionId, personId, formData, PeopleScope.ADMIN);
}

async function updatePersonActionInternal(
  institutionId: string,
  personId: string,
  formData: FormData,
  scope: PeopleScopeType = PeopleScope.ADMIN,
): Promise<PersonActionState> {
  if (!isValidUuid(institutionId) || !isValidUuid(personId)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

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
      password: formData.get("password") || "",
      confirmPassword: formData.get("confirmPassword") || "",
    };

    const parsed = updatePersonFormSchema.safeParse(payload);
    if (!parsed.success) {
      return getValidationActionState(parsed.error.issues, PERSON_FORM_FIELD_NAMES);
    }

    const updateBody: Record<string, unknown> = {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phoneNumber: parsed.data.phoneNumber,
    };

    if (parsed.data.password) {
      updateBody.password = parsed.data.password;
    }

    const errorState = await getResponseErrorActionState(
      peopleApiFetch(scope, getPeoplePath(scope, institutionId, personId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateBody),
      }),
      PERSON_FORM_FIELD_NAMES,
      PEOPLE_ERROR_MESSAGES.UPDATE_PERSON,
    );
    if (errorState) return errorState;
  }

  if (roleIds) {
    const roleError = await getResponseErrorActionState(
      peopleApiFetch(scope, `${getPeoplePath(scope, institutionId, personId)}/roles`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleIds }),
      }),
      PERSON_FORM_FIELD_NAMES,
      PEOPLE_ERROR_MESSAGES.ASSIGN_SELECTED_ROLE,
    );
    if (roleError) {
      return roleError;
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

function revalidatePersonPaths(institutionId: string, personId: string, scope: PeopleScope): void {
  revalidatePath(PeopleScope.isInstitutional(scope) ? "/people" : `/admin/institutions/${institutionId}/people`);
  revalidatePath(
    PeopleScope.isInstitutional(scope)
      ? `/people/${personId}`
      : `/admin/institutions/${institutionId}/people/${personId}`,
  );
}
