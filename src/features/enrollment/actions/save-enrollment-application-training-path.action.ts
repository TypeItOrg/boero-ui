"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { BackendError } from "@common/types/backend-error.types";
import { INVALID_ACTION_ARGUMENTS } from "@common/utils/action-argument.util";
import { getValidationActionState } from "@common/utils/action-state.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import type { EnrollmentApplicationActionState } from "@features/enrollment/types/enrollment-application-action-state.types";
import type { EnrollmentApplicationDraftData } from "@features/enrollment/types/enrollment-application-draft-data.types";
import { isApplicantInstitutionalUser } from "@features/enrollment/utils/is-applicant-institutional-user.util";

const fields = ["trainingPathId"] as const;
const actionContextSchema = z.object({
  applicationId: z.string().uuid(),
});
const formSchema = z.object({
  currentData: z.string().trim().min(2, "No se pudieron preparar los datos de la solicitud."),
  trainingPathId: z.string().trim().min(1, "Seleccioná un trayecto formativo.").uuid("Seleccioná un trayecto formativo."),
});

export async function saveEnrollmentApplicationTrainingPathAction(
  applicationId: string,
  _state: EnrollmentApplicationActionState,
  formData: FormData,
): Promise<EnrollmentApplicationActionState> {
  const context = actionContextSchema.safeParse({ applicationId });
  if (!context.success) return { error: INVALID_ACTION_ARGUMENTS };

  const parsed = formSchema.safeParse({
    currentData: formData.get("currentData"),
    trainingPathId: formData.get("trainingPathId"),
  });
  if (!parsed.success) return getValidationActionState(parsed.error.issues, fields);

  const user = await requireInstitutionalUser();
  if (!isApplicantInstitutionalUser(user)) {
    return { error: "No tenés permisos para editar esta solicitud." };
  }

  const currentData = parseDraftData(parsed.data.currentData);
  if (!currentData) {
    return {
      fieldErrors: { trainingPathId: "No se pudieron preparar los datos actuales de la solicitud." },
    };
  }

  const nextData: EnrollmentApplicationDraftData = {
    ...currentData,
    careerSelection: {
      ...(currentData.careerSelection ?? {}),
      trainingPathId: parsed.data.trainingPathId,
    },
  };

  const error = await getTrainingPathErrorState(
    institutionalApiFetch(`/api/v1/enrollment-applications/${context.data.applicationId}/draft`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: nextData }),
    }),
    "No se pudo guardar el trayecto formativo seleccionado.",
  );
  if (error) return error;

  revalidatePath(`/enrollment-applications/${context.data.applicationId}/training-path`);
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

async function getTrainingPathErrorState(
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
    const fieldError =
      error.fieldErrors?.trainingPathId ?? error.fieldErrors?.["data.careerSelection.trainingPathId"];

    return {
      error: error.message || fallbackMessage,
      ...(fieldError ? { fieldErrors: { trainingPathId: fieldError } } : {}),
    };
  } catch {
    return { error: fallbackMessage };
  }
}
