"use server";

import { revalidatePath } from "next/cache";

import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import { institutionFormSchema } from "@features/institutions/schemas/institution-form.schema";
import {
  INSTITUTION_FORM_FIELD_NAMES,
  type InstitutionActionState,
} from "@features/institutions/types/institution-action-state.types";

export async function createInstitutionAction(formData: FormData): Promise<InstitutionActionState> {
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

  const response = await platformApiFetch("/api/v1/institutions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parsed.data),
  });

  if (!response.ok) {
    return getResponseErrorActionState(response, INSTITUTION_FORM_FIELD_NAMES, "Error al crear la institución.");
  }

  revalidatePath("/platform/institutions");
  return { success: true };
}
