"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { z } from "zod";

import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { getSafeReturnTo } from "@common/utils/return-to.util";

import {
  ACADEMIC_ACTION_FIELDS,
  STATUS_INPUT_BUILDERS,
  STATUS_PERMISSIONS,
  actionContextSchema,
  getStatusRequestBody,
  invalidActionState,
  statusResourceSchema,
} from "@features/academic/config/academic-resource-action.config";
import { academicStatusSchema } from "@features/academic/schemas/academic-form.schema";
import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import type { StatusResource } from "@features/academic/types/status-resource.types";
import { authorizeAcademicAction } from "@features/academic/utils/academic-action-auth.util";
import { getAcademicApiBase, getAcademicResourceRoute, type AcademicScope as AcademicScopeType } from "@features/academic/utils/academic-scope.util";

export async function updateAcademicStatusAction(
  scope: AcademicScopeType,
  institutionId: string,
  resource: StatusResource,
  id: string,
  returnTo: string | undefined,
  _state: AcademicActionState,
  formData: FormData,
): Promise<AcademicActionState> {
  const context = actionContextSchema.extend({ resource: statusResourceSchema, id: z.uuid() }).safeParse({
    scope,
    institutionId,
    resource,
    id,
    returnTo,
  });

  if (!context.success) {
    return invalidActionState();
  }

  const authError = await authorizeAcademicAction(context.data.scope, context.data.institutionId, STATUS_PERMISSIONS[context.data.resource]);

  if (authError) {
    return authError;
  }

  const raw = STATUS_INPUT_BUILDERS[context.data.resource](formData);

  const parsed = academicStatusSchema.safeParse(raw);

  if (!parsed.success) {
    return getValidationActionState(parsed.error.issues, ACADEMIC_ACTION_FIELDS);
  }

  const body = getStatusRequestBody(parsed.data);

  const path = `${getAcademicApiBase(context.data.scope, context.data.institutionId)}/${context.data.resource}/${context.data.id}/status`;

  const error = await getResponseErrorActionState(
    academicApiFetch(context.data.scope, path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    ACADEMIC_ACTION_FIELDS,
    "No se pudo actualizar el estado.",
  );

  if (error) {
    return error;
  }

  const fallback = getAcademicResourceRoute(context.data.scope, context.data.institutionId, context.data.resource);

  revalidatePath(fallback);
  redirect(getSafeReturnTo(context.data.returnTo, fallback));
}
