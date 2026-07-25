"use server";

import { revalidatePath } from "next/cache";

import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import { createPersonFormSchema } from "@features/people/schemas/person-form.schema";
import { peopleApiFetch } from "@features/people/services/people-api-fetch.service";
import { requirePlatformAccount } from "@features/platform-auth/services/get-platform-account.service";
import { PERSON_FORM_FIELD_NAMES, type PersonActionState } from "@features/people/types/person-action-state.types";
import {
  getPeoplePath,
  PeopleScope,
  type PeopleScope as PeopleScopeType,
} from "@features/people/utils/people-scope.util";

export async function createInstitutionalPersonAction(
  institutionId: string,
  formData: FormData,
): Promise<PersonActionState> {
  await requireInstitutionalUser();
  return createPersonActionInternal(institutionId, formData, PeopleScope.INSTITUTIONAL);
}

export async function createPlatformPersonAction(
  institutionId: string,
  formData: FormData,
): Promise<PersonActionState> {
  await requirePlatformAccount();
  return createPersonActionInternal(institutionId, formData, PeopleScope.ADMIN);
}

async function createPersonActionInternal(
  institutionId: string,
  formData: FormData,
  scope: PeopleScopeType = PeopleScope.ADMIN,
): Promise<PersonActionState> {
  const payload = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    documentNumber: formData.get("documentNumber"),
    email: formData.get("email") || "",
    phoneNumber: formData.get("phoneNumber") || "",
    birthDate: formData.get("birthDate") || "",
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = createPersonFormSchema.safeParse(payload);
  if (!parsed.success) {
    return getValidationActionState(parsed.error.issues, PERSON_FORM_FIELD_NAMES);
  }

  const response = peopleApiFetch(scope, getPeoplePath(scope, institutionId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      documentNumber: parsed.data.documentNumber,
      email: parsed.data.email,
      phoneNumber: parsed.data.phoneNumber,
      birthDate: parsed.data.birthDate || null,
      password: parsed.data.password,
      initialRole: "APPLICANT",
    }),
  });

  const errorState = await getResponseErrorActionState(
    response,
    PERSON_FORM_FIELD_NAMES,
    PEOPLE_ERROR_MESSAGES.CREATE_PERSON,
  );
  if (errorState) return errorState;

  revalidatePath(PeopleScope.isInstitutional(scope) ? "/people" : `/admin/institutions/${institutionId}/people`);
  return { success: true };
}
