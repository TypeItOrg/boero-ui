"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { z } from "zod";

import { getResponseErrorActionState } from "@common/utils/action-state.util";
import { getSafeReturnTo } from "@common/utils/return-to.util";

import {
  ACADEMIC_ACTION_FIELDS,
  DELETE_PERMISSIONS,
  RESTORE_PERMISSIONS,
  actionContextSchema,
  deletableResourceSchema,
  invalidActionState,
  restorableResourceSchema,
} from "@features/academic/config/academic-resource-action.config";
import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { LifecycleResource } from "@features/academic/types/lifecycle-resource.types";
import { authorizeAcademicAction } from "@features/academic/utils/academic-action-auth.util";
import { getAcademicApiBase, getAcademicResourceRoute, type AcademicScope as AcademicScopeType } from "@features/academic/utils/academic-scope.util";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";

export async function deleteAcademicResourceAction(
  scope: AcademicScopeType,
  institutionId: string,
  resource:
    | AcademicResource.ACADEMIC_YEAR
    | AcademicResource.TRAINING_PATH
    | AcademicResource.STUDY_PLAN
    | AcademicResource.ACADEMIC_SPACE
    | AcademicResource.INSTRUMENT
    | AcademicResource.COURSE
    | AcademicResource.SHIFT
    | AcademicResource.ACADEMIC_LEVEL
    | AcademicResource.STUDY_PLAN_SPACE
    | AcademicResource.PREREQUISITE,
  id: string,
  destination: string,
  _state: AcademicActionState,
  _formData: FormData,
): Promise<AcademicActionState> {
  void _state;
  void _formData;
  const context = actionContextSchema
    .extend({ resource: deletableResourceSchema, id: z.uuid(), destination: z.string() })
    .safeParse({ scope, institutionId, resource, id, destination });

  if (!context.success) {
    return invalidActionState();
  }

  const permission = restorableResourceSchema.safeParse(context.data.resource).success
    ? DELETE_PERMISSIONS[context.data.resource as LifecycleResource]
    : INSTITUTIONAL_PERMISSION.STUDY_PLAN_CURRICULUM_UPDATE;
  const authError = await authorizeAcademicAction(context.data.scope, context.data.institutionId, permission);

  if (authError) {
    return authError;
  }

  const error = await getResponseErrorActionState(
    academicApiFetch(
      context.data.scope,
      `${getAcademicApiBase(context.data.scope, context.data.institutionId)}/${context.data.resource}/${context.data.id}`,
      { method: "DELETE" },
    ),
    ACADEMIC_ACTION_FIELDS,
    "No se pudo eliminar el elemento.",
  );

  if (error) {
    return error;
  }

  const fallback = getAcademicResourceRoute(context.data.scope, context.data.institutionId, context.data.resource);
  revalidatePath(fallback);
  redirect(getSafeReturnTo(context.data.destination, fallback));
}

export async function restoreAcademicResourceAction(
  scope: AcademicScopeType,
  institutionId: string,
  resource: LifecycleResource,
  id: string,
  destination: string,
  _state: AcademicActionState,
  _formData: FormData,
): Promise<AcademicActionState> {
  void _state;
  void _formData;
  const context = actionContextSchema
    .extend({ resource: restorableResourceSchema, id: z.uuid(), destination: z.string() })
    .safeParse({ scope, institutionId, resource, id, destination });

  if (!context.success) {
    return invalidActionState();
  }

  const authError = await authorizeAcademicAction(context.data.scope, context.data.institutionId, RESTORE_PERMISSIONS[context.data.resource]);

  if (authError) {
    return authError;
  }

  const apiBase = getAcademicApiBase(context.data.scope, context.data.institutionId);
  const error = await getResponseErrorActionState(
    academicApiFetch(context.data.scope, `${apiBase}/${context.data.resource}/${context.data.id}/restore`, {
      method: "POST",
    }),
    ACADEMIC_ACTION_FIELDS,
    "No se pudo restaurar el elemento.",
  );

  if (error) {
    return error;
  }

  const fallback = getAcademicResourceRoute(context.data.scope, context.data.institutionId, context.data.resource);
  revalidatePath(fallback);
  redirect(getSafeReturnTo(context.data.destination, fallback));
}
