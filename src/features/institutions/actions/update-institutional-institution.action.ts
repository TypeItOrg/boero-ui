"use server";

import { revalidatePath } from "next/cache";

import { INVALID_ACTION_ARGUMENTS, isValidUuid } from "@common/utils/action-argument.util";
import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";

import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";
import { institutionalInstitutionFormSchema } from "@features/institutions/schemas/institutional-institution-form.schema";
import { saveInstitutionLogoChange } from "@features/institutions/services/save-institution-logo-change.service";
import { type InstitutionActionState } from "@features/institutions/types/institution-action-state.types";
import { INSTITUTION_FORM_FIELD_NAMES } from "@features/institutions/types/institution-form-field-name.types";
import { parseInstitutionLogoChange } from "@features/institutions/utils/institution-logo-form.util";

export async function updateInstitutionalInstitutionAction(institutionId: string, formData: FormData): Promise<InstitutionActionState> {
  if (!isValidUuid(institutionId)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

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

  const logoChange = parseInstitutionLogoChange(formData);

  if ("error" in logoChange) {
    return { logoError: logoChange.error };
  }

  const response = institutionalApiFetch(`/api/v1/institutions/${institutionId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parsed.data),
  });

  const errorState = await getResponseErrorActionState(response, INSTITUTION_FORM_FIELD_NAMES, INSTITUTION_ERROR_MESSAGES.UPDATE_INSTITUTION);

  if (errorState) {
    return errorState;
  }

  const logoError = await saveInstitutionLogoChange(institutionId, logoChange);

  revalidatePath("/institution");
  revalidatePath("/institution/edit");
  revalidatePath("/");

  return logoError ?? { success: true };
}
