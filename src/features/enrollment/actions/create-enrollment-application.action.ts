"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { INVALID_ACTION_ARGUMENTS } from "@common/utils/action-argument.util";
import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import type { EnrollmentApplication } from "@features/enrollment/types/enrollment-application.types";
import type { EnrollmentApplicationActionState } from "@features/enrollment/types/enrollment-application-action-state.types";
import { isApplicantInstitutionalUser } from "@features/enrollment/utils/is-applicant-institutional-user.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";

const fields = ["studyPlanId", "academicYearId"] as const;
const actionContextSchema = z.object({
  returnTo: z.string().optional(),
});
const formSchema = z.object({
  studyPlanId: z.string().trim().min(1, "Seleccioná un plan de estudio.").uuid("Seleccioná un plan de estudio."),
  academicYearId: z.string().trim().min(1, "Seleccioná un ciclo lectivo.").uuid("Seleccioná un ciclo lectivo."),
});

export async function createEnrollmentApplicationAction(
  returnTo: string | undefined,
  _state: EnrollmentApplicationActionState,
  formData: FormData,
): Promise<EnrollmentApplicationActionState> {
  const context = actionContextSchema.safeParse({ returnTo });
  if (!context.success) return { error: INVALID_ACTION_ARGUMENTS };

  const parsed = formSchema.safeParse({
    studyPlanId: formData.get("studyPlanId"),
    academicYearId: formData.get("academicYearId"),
  });
  if (!parsed.success) return getValidationActionState(parsed.error.issues, fields);

  const user = await requireInstitutionalUser();
  if (!isApplicantInstitutionalUser(user)) {
    return { error: "No tenés permisos para crear solicitudes." };
  }

  let response: Response;

  try {
    response = await institutionalApiFetch("/api/v1/enrollment-applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { error: "No se pudo crear la solicitud de inscripción." };
  }

  const error = await getResponseErrorActionState(response, fields, "No se pudo crear la solicitud de inscripción.");
  if (error) return error;

  let application: EnrollmentApplication;

  try {
    application = (await response.json()) as EnrollmentApplication;
  } catch {
    return { error: "La solicitud se creó, pero no se pudo abrir automáticamente." };
  }

  revalidatePath("/enrollment-applications");
  redirect(
    `/enrollment-applications/${application.applicationId}/training-path?returnTo=${encodeURIComponent(getSafeReturnTo(context.data.returnTo, "/enrollment-applications"))}`,
  );
}
