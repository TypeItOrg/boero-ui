"use server";

import { revalidatePath } from "next/cache";

import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import { createPersonFormSchema } from "@features/people/schemas/person-form.schema";
import { PERSON_FORM_FIELD_NAMES, type PersonActionState } from "../types/person-action-state.types";

export async function createPersonAction(institutionId: string, formData: FormData): Promise<PersonActionState> {
  const payload = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    documentNumber: formData.get("documentNumber"),
    email: formData.get("email") || "",
    phoneNumber: formData.get("phoneNumber") || "",
    birthDate: formData.get("birthDate") || "",
    password: formData.get("password"),
  };

  const parsed = createPersonFormSchema.safeParse(payload);
  if (!parsed.success) {
    return getValidationActionState(parsed.error.issues, PERSON_FORM_FIELD_NAMES);
  }

  const response = platformApiFetch(`/api/v1/institutions/${institutionId}/people`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...parsed.data,
      birthDate: parsed.data.birthDate || null,
      initialRole: "APPLICANT",
    }),
  });

  const errorState = await getResponseErrorActionState(
    response,
    PERSON_FORM_FIELD_NAMES,
    PEOPLE_ERROR_MESSAGES.CREATE_PERSON,
  );
  if (errorState) return errorState;

  revalidatePath(`/platform/institutions/${institutionId}/people`);
  return { success: true };
}
