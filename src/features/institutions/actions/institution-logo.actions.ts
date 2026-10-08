"use server";

import { revalidatePath } from "next/cache";

import { INVALID_ACTION_ARGUMENTS, isValidUuid } from "@common/utils/action-argument.util";
import { getResponseErrorActionState } from "@common/utils/action-state.util";

import { getInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";
import type { InstitutionLogoState } from "@features/institutions/types/institution-logo-state.types";
import type { Institution } from "@features/institutions/types/institution.types";
import { getInstitutionLogoFileError } from "@features/institutions/utils/institution-logo-form.util";
import { getInstitutionLogoUrl } from "@features/institutions/utils/institution-logo-url.util";

async function saveLogo(institutionId: string, formData?: FormData): Promise<InstitutionLogoState> {
  if (!isValidUuid(institutionId)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const user = await getInstitutionalUser();

  if (!user || user.institutionId !== institutionId || !hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.INSTITUTION_UPDATE)) {
    return { error: INSTITUTION_ERROR_MESSAGES.LOGO_FORBIDDEN };
  }

  let upload: FormData | undefined;

  if (formData) {
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return { fieldErrors: { file: INSTITUTION_ERROR_MESSAGES.LOGO_INVALID_FILE } };
    }

    const fileError = getInstitutionLogoFileError(file);

    if (fileError) {
      return { fieldErrors: { file: fileError } };
    }

    upload = new FormData();
    upload.set("file", file);
  }

  const responsePromise = institutionalApiFetch(`/api/v1/institutions/${institutionId}/logo`, {
    method: upload ? "PUT" : "DELETE",
    body: upload,
  });

  const fallback = upload ? INSTITUTION_ERROR_MESSAGES.LOGO_UPDATE : INSTITUTION_ERROR_MESSAGES.LOGO_REMOVE;

  const error = await getResponseErrorActionState(responsePromise, ["file"], fallback);

  if (error) {
    return error;
  }

  let logoUrl: string | null = null;

  if (upload) {
    try {
      const institution = (await (await responsePromise).json()) as Institution;

      logoUrl = institution.logoUrl;

      if (typeof logoUrl !== "string" || !getInstitutionLogoUrl(institutionId, logoUrl)) {
        return { error: fallback };
      }
    } catch {
      return { error: fallback };
    }
  }

  revalidatePath(`/admin/institutions/${institutionId}`);
  revalidatePath(`/admin/institutions/${institutionId}/edit`);
  revalidatePath("/institution");
  revalidatePath("/institution/edit");
  revalidatePath("/auth", "layout");

  return { success: true, logoUrl };
}

export async function uploadInstitutionalInstitutionLogo(
  institutionId: string,
  _previousState: InstitutionLogoState,
  formData: FormData,
): Promise<InstitutionLogoState> {
  return saveLogo(institutionId, formData);
}

export async function removeInstitutionalInstitutionLogo(institutionId: string): Promise<InstitutionLogoState> {
  return saveLogo(institutionId);
}
