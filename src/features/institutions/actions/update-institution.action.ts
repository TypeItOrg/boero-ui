"use server";

import { revalidatePath } from "next/cache";
import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import { institutionFormSchema } from "../schemas/institution-form.schema";
import { INSTITUTION_FORM_FIELD_NAMES, type InstitutionActionState } from "../types/institution-action-state.types";

export async function updateInstitutionAction(id: string, formData: FormData): Promise<InstitutionActionState> {
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

  const active = formData.get("active") === "true";

  const response = await platformApiFetch(`/api/v1/institutions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...parsed.data,
      active,
    }),
  });

  if (!response.ok) {
    return getResponseErrorActionState(response, INSTITUTION_FORM_FIELD_NAMES, "Error al actualizar la institución.");
  }

  revalidatePath("/platform/institutions");
  revalidatePath(`/platform/institutions/${id}`);
  revalidatePath(`/platform/institutions/${id}/edit`);
  return { success: true };
}
