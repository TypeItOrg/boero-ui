"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { BackendError } from "@common/types/backend-error.types";
import { INVALID_ACTION_ARGUMENTS } from "@common/utils/action-argument.util";
import { getValidationActionState } from "@common/utils/action-state.util";
import type { EnrollmentApplicationActionState } from "@features/enrollment/types/enrollment-application-action-state.types";
import type { EnrollmentApplicationDraftData } from "@features/enrollment/types/enrollment-application-draft-data.types";
import { isApplicantInstitutionalUser } from "@features/enrollment/utils/is-applicant-institutional-user.util";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

const fields = ["studyPlanSpaceIds"] as const;
const actionContextSchema = z.object({
  applicationId: z.string().uuid(),
});
const formSchema = z.object({
  currentData: z.string().trim().min(2, "No se pudieron preparar los datos de la solicitud."),
  studyPlanSpaceIds: z.array(z.string().trim().uuid("Seleccion invalida de espacios academicos.")),
});

export async function saveEnrollmentApplicationStudyPlanSpacesAction(
  applicationId: string,
  _state: EnrollmentApplicationActionState,
  formData: FormData,
): Promise<EnrollmentApplicationActionState> {
  const context = actionContextSchema.safeParse({ applicationId });
  if (!context.success) return { error: INVALID_ACTION_ARGUMENTS };

  const parsed = formSchema.safeParse({
    currentData: formData.get("currentData"),
    studyPlanSpaceIds: formData.getAll("studyPlanSpaceIds").filter((value): value is string => typeof value === "string"),
  });
  if (!parsed.success) return getValidationActionState(parsed.error.issues, fields);

  const user = await requireInstitutionalUser();
  if (!isApplicantInstitutionalUser(user)) {
    return { error: "No tenes permisos para editar esta solicitud." };
  }

  const currentData = parseDraftData(parsed.data.currentData);
  if (!currentData) {
    return {
      fieldErrors: { studyPlanSpaceIds: "No se pudieron preparar los datos actuales de la solicitud." },
    };
  }

  const studyPlanSpaceIds = Array.from(new Set(parsed.data.studyPlanSpaceIds));
  const nextData: EnrollmentApplicationDraftData = {
    ...currentData,
    academicSpaceSelection: {
      ...(currentData.academicSpaceSelection ?? {}),
      studyPlanSpaceIds,
    },
  };

  const error = await getStudyPlanSpacesErrorState(
    institutionalApiFetch(`/api/v1/enrollment-applications/${context.data.applicationId}/draft`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: nextData }),
    }),
    "No se pudo guardar la seleccion de espacios academicos.",
  );
  if (error) return error;

  revalidatePath(`/enrollment-applications/${context.data.applicationId}/study-plan-spaces`);
  return { success: true };
}

function parseDraftData(rawData: string): EnrollmentApplicationDraftData | null {
  try {
    const parsed = JSON.parse(rawData) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as EnrollmentApplicationDraftData;
  } catch {
    return null;
  }
}

async function getStudyPlanSpacesErrorState(
  responsePromise: Promise<Response>,
  fallbackMessage: string,
): Promise<EnrollmentApplicationActionState | undefined> {
  let response: Response;

  try {
    response = await responsePromise;
  } catch {
    return { error: fallbackMessage };
  }

  if (response.ok) return undefined;

  try {
    const error = (await response.json()) as BackendError;
    const fieldError = error.fieldErrors?.studyPlanSpaceIds ?? error.fieldErrors?.["data.academicSpaceSelection.studyPlanSpaceIds"];

    return {
      error: error.message || fallbackMessage,
      ...(fieldError ? { fieldErrors: { studyPlanSpaceIds: fieldError } } : {}),
    };
  } catch {
    return { error: fallbackMessage };
  }
}
