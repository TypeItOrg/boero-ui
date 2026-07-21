"use server";

import { revalidatePath } from "next/cache";
import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { institutionalInstitutionFormSchema } from "@features/institutions/schemas/institutional-institution-form.schema";
import {
  INSTITUTION_FORM_FIELD_NAMES,
  type InstitutionActionState,
} from "@features/institutions/types/institution-action-state.types";

export async function updateInstitutionalInstitutionAction(
  institutionId: string,
  formData: FormData,
): Promise<InstitutionActionState> {
  const payload = {
    name: formData.get("name"),
    cityId: formData.get("cityId"),
    street: formData.get("street"),
    number: formData.get("number"),
    neighborhood: formData.get("neighborhood") || "",
    additionalInfo: formData.get("additionalInfo") || "",
    phoneNumber: formData.get("phoneNumber") || "",
    email: formData.get("email") || "",
  };

  const parsed = institutionalInstitutionFormSchema.safeParse(payload);
  if (!parsed.success) {
    return getValidationActionState(parsed.error.issues, INSTITUTION_FORM_FIELD_NAMES);
  }

  const response = institutionalApiFetch(`/api/v1/institutions/${institutionId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parsed.data),
  });

  const errorState = await getResponseErrorActionState(
    response,
    INSTITUTION_FORM_FIELD_NAMES,
    INSTITUTION_ERROR_MESSAGES.UPDATE_INSTITUTION,
  );
  if (errorState) return errorState;

  revalidatePath("/institution");
  revalidatePath("/institution/edit");
  revalidatePath("/");
  return { success: true };
}
