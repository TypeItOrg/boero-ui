"use server";

import { revalidatePath } from "next/cache";

import { INVALID_ACTION_ARGUMENTS, isValidUuid } from "@common/utils/action-argument.util";
import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";

import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";
import { INSTITUTION_LOGO_API_INTENT, INSTITUTION_LOGO_INTENT } from "@features/institutions/constants/institution-logo.constants";
import { institutionFormSchema } from "@features/institutions/schemas/institution-form.schema";
import type { InstitutionActionState } from "@features/institutions/types/institution-action-state.types";
import { INSTITUTION_FORM_FIELD_NAMES } from "@features/institutions/types/institution-form-field-name.types";
import { parseInstitutionLogoChange } from "@features/institutions/utils/institution-logo-form.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

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

  const publicSubdomain = formData.get("publicSubdomain");

  if (typeof publicSubdomain !== "string" || (publicSubdomain !== "" && !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(publicSubdomain))) {
    return { publicSubdomainError: INSTITUTION_ERROR_MESSAGES.PUBLIC_ACCESS_INVALID };
  }

  const logoChange = parseInstitutionLogoChange(formData);

  if ("error" in logoChange) {
    return { logoError: logoChange.error };
  }

  const data = {
    institution: { ...parsed.data, active: rawActive === "true" },
    publicSubdomain: publicSubdomain || null,
    logoIntent: INSTITUTION_LOGO_API_INTENT[logoChange.intent],
  };

  const body = new FormData();

  body.set("data", new Blob([JSON.stringify(data)], { type: "application/json" }));

  if (logoChange.intent === INSTITUTION_LOGO_INTENT.REPLACE) {
    body.set("file", logoChange.file);
  }

  const errorState = await getResponseErrorActionState(
    platformApiFetch(`/api/v1/admin/institutions/${id}`, { method: "PUT", body }),
    [...INSTITUTION_FORM_FIELD_NAMES.map((field) => `institution.${field}`), "publicSubdomain", "file"],
    INSTITUTION_ERROR_MESSAGES.UPDATE_INSTITUTION,
  );

  if (errorState) {
    if (errorState.error === INSTITUTION_ERROR_MESSAGES.LOGO_INVALID_FILE || errorState.error === INSTITUTION_ERROR_MESSAGES.LOGO_TOO_LARGE) {
      return { logoError: errorState.error };
    }

    const fieldErrors: InstitutionActionState["fieldErrors"] = {};

    for (const field of INSTITUTION_FORM_FIELD_NAMES) {
      const message = errorState.fieldErrors?.[`institution.${field}`];

      if (message) {
        fieldErrors[field] = message;
      }
    }

    return {
      error: errorState.error,
      fieldErrors,
      publicSubdomainError: errorState.fieldErrors?.publicSubdomain,
      logoError: errorState.fieldErrors?.file,
    };
  }

  revalidatePath("/admin/institutions");
  revalidatePath(`/admin/institutions/${id}`);
  revalidatePath(`/admin/institutions/${id}/edit`);
  revalidatePath("/institution");
  revalidatePath("/institution/edit");
  revalidatePath("/auth", "layout");

  return { success: true };
}
