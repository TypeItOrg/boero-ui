"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { z } from "zod";

import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { appendReturnTo, getSafeReturnTo } from "@common/utils/return-to.util";

import { ACADEMIC_ACTION_FIELDS, actionContextSchema, invalidActionState } from "@features/academic/config/academic-resource-action.config";
import { parseStudyPlanVersionForm } from "@features/academic/schemas/academic-form.schema";
import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { authorizeAcademicAction } from "@features/academic/utils/academic-action-auth.util";
import { getAcademicApiBase, getAcademicResourceRoute, type AcademicScope as AcademicScopeType } from "@features/academic/utils/academic-scope.util";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";

export async function createStudyPlanVersionAction(
  scope: AcademicScopeType,
  institutionId: string,
  sourceId: string,
  returnTo: string | undefined,
  _state: AcademicActionState,
  formData: FormData,
): Promise<AcademicActionState> {
  const context = actionContextSchema.extend({ sourceId: z.uuid() }).safeParse({
    scope,
    institutionId,
    resource: AcademicResource.STUDY_PLAN,
    sourceId,
    returnTo,
  });

  if (!context.success) {
    return invalidActionState();
  }

  const authError = await authorizeAcademicAction(context.data.scope, context.data.institutionId, INSTITUTIONAL_PERMISSION.STUDY_PLAN_CREATE);

  if (authError) {
    return authError;
  }

  const parsed = parseStudyPlanVersionForm(formData);

  if (!parsed.success) {
    return getValidationActionState(parsed.error.issues, ACADEMIC_ACTION_FIELDS);
  }

  const apiBase = getAcademicApiBase(context.data.scope, context.data.institutionId);
  const request = academicApiFetch(context.data.scope, `${apiBase}/study-plans/${context.data.sourceId}/versions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  const error = await getResponseErrorActionState(request, ACADEMIC_ACTION_FIELDS, "No se pudo crear la nueva versión.");

  if (error) {
    return error;
  }

  let createdId: string;

  try {
    const response = await request;
    const created = (await response.json()) as { id?: unknown };
    const parsedId = z.uuid().safeParse(created.id);

    if (!parsedId.success) {
      return { error: "La API devolvió una versión inválida." };
    }

    createdId = parsedId.data;
  } catch {
    return { error: "La API no devolvió la nueva versión." };
  }

  const fallback = getAcademicResourceRoute(context.data.scope, context.data.institutionId, AcademicResource.STUDY_PLAN);
  revalidatePath(fallback);
  const origin = getSafeReturnTo(context.data.returnTo, fallback);
  redirect(appendReturnTo(`${fallback}/${createdId}`, origin));
}
