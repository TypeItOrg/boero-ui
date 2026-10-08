"use server";

import { revalidatePath } from "next/cache";
import { INVALID_ACTION_ARGUMENTS, isValidUuid } from "@common/utils/action-argument.util";
import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import { institutionFormSchema } from "@features/institutions/schemas/institution-form.schema";
import { type InstitutionActionState } from "@features/institutions/types/institution-action-state.types";
import { INSTITUTION_FORM_FIELD_NAMES } from "@features/institutions/types/institution-form-field-name.types";
import { parseInstitutionLogoChange } from "@features/institutions/utils/institution-logo-form.util";
import { saveInstitutionLogoChange } from "@features/institutions/services/save-institution-logo-change.service";

export async function updateInstitutionAction(id: string, formData: FormData): Promise<InstitutionActionState> {
  if (!isValidUuid(id)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const rawActive = formData.get("active");
  if (rawActive !== "true" && rawActive !== "false") {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const payload = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    cityId: formData.get("cityId"),
    street: formData.get("street"),
    number: formData.get("number"),
    neighborhood: formData.get("neighborhood") || "",
    additionalInfo: formData.get("additionalInfo") || "",
    phoneNumber: formData.get("phoneNumber") || "",
    email: formData.get("email") || "",
  };

  const parsed = institutionFormSchema.safeParse(payload);
  if (!parsed.success) {
    return getValidationActionState(parsed.error.issues, INSTITUTION_FORM_FIELD_NAMES);
  }

  const logoChange = parseInstitutionLogoChange(formData);
  if ("error" in logoChange) {
    return { logoError: logoChange.error };
  }

  const active = rawActive === "true";

  const response = platformApiFetch(`/api/v1/admin/institutions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...parsed.data,
      active,
    }),
  });

  const errorState = await getResponseErrorActionState(response, INSTITUTION_FORM_FIELD_NAMES, INSTITUTION_ERROR_MESSAGES.UPDATE_INSTITUTION);
  if (errorState) {
    return errorState;
  }

  const logoError = await saveInstitutionLogoChange(id, "platform", logoChange);

  revalidatePath("/admin/institutions");
  revalidatePath(`/admin/institutions/${id}`);
  revalidatePath(`/admin/institutions/${id}/edit`);
  return logoError ?? { success: true };
}
