"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import {
  ACADEMIC_ACTION_FIELDS,
  actionContextSchema,
  deletableResourceSchema,
  DELETE_PERMISSIONS,
  getStatusRequestBody,
  invalidActionState,
  type ParsedFormData,
  resolveCatalogStatusChange,
  RESOURCE_ACTION_CONFIG,
  RESTORE_PERMISSIONS,
  restorableResourceSchema,
  STATUS_INPUT_BUILDERS,
  STATUS_PERMISSIONS,
  statusResourceSchema,
} from "@features/academic/config/academic-resource-action.config";
import { academicStatusSchema, parseAcademicForm } from "@features/academic/schemas/academic-form.schema";
import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { LifecycleResource } from "@features/academic/types/lifecycle-resource.types";
import type { StatusResource } from "@features/academic/types/status-resource.types";
import { authorizeAcademicAction } from "@features/academic/utils/academic-action-auth.util";
import { getAcademicApiBase, getAcademicResourceRoute, type AcademicScope as AcademicScopeType } from "@features/academic/utils/academic-scope.util";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";

export async function saveAcademicResourceAction(
  scope: AcademicScopeType,
  institutionId: string,
  resource: AcademicResource,
  id: string | undefined,
  parentId: string | undefined,
  returnTo: string | undefined,
  _state: AcademicActionState,
  formData: FormData,
): Promise<AcademicActionState> {
  const context = actionContextSchema.safeParse({ scope, institutionId, resource, id, parentId, returnTo });
  if (!context.success) return invalidActionState();

  const config = RESOURCE_ACTION_CONFIG[context.data.resource];
  const requiredPermission = context.data.id ? config.updatePermission : config.createPermission;
  const authError = await authorizeAcademicAction(context.data.scope, context.data.institutionId, requiredPermission);
  if (authError) return authError;

  const catalogStatus = resolveCatalogStatusChange(context.data.resource, context.data.id, formData);
  if (catalogStatus.error) return catalogStatus.error;

  if (catalogStatus.nextActiveStatus !== null && catalogStatus.formStatusResource) {
    const statusAuthError = await authorizeAcademicAction(
      context.data.scope,
      context.data.institutionId,
      STATUS_PERMISSIONS[catalogStatus.formStatusResource],
    );
    if (statusAuthError) return statusAuthError;
  }

  const parsed = parseAcademicForm(context.data.resource, formData);
  if (!parsed.success) return getValidationActionState(parsed.error.issues, ACADEMIC_ACTION_FIELDS);

  const data = parsed.data as ParsedFormData;
  const apiBase = getAcademicApiBase(context.data.scope, context.data.institutionId);
  const path = context.data.id ? `${apiBase}/${context.data.resource}/${context.data.id}` : config.createPath(apiBase, context.data.parentId, data);
  const body = config.prepareBody?.(data) ?? data;
  const error = await getResponseErrorActionState(
    academicApiFetch(context.data.scope, path, {
      method: context.data.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    ACADEMIC_ACTION_FIELDS,
    "No se pudo guardar la configuración académica.",
  );
  if (error) return error;

  if (catalogStatus.nextActiveStatus !== null && catalogStatus.formStatusResource && context.data.id) {
    const statusFormData = new FormData();
    statusFormData.set("active", catalogStatus.nextActiveStatus);
    const statusState = await updateAcademicStatusAction(
      context.data.scope,
      context.data.institutionId,
      catalogStatus.formStatusResource,
      context.data.id,
      context.data.returnTo,
      {},
      statusFormData,
    );
    if (statusState) return statusState;
  }

  const fallback = getAcademicResourceRoute(context.data.scope, context.data.institutionId, context.data.resource);
  revalidatePath(fallback);
  redirect(getSafeReturnTo(context.data.returnTo, fallback));
}

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
  if (!context.success) return invalidActionState();

  const authError = await authorizeAcademicAction(context.data.scope, context.data.institutionId, STATUS_PERMISSIONS[context.data.resource]);
  if (authError) return authError;

  const raw = STATUS_INPUT_BUILDERS[context.data.resource](formData);
  const parsed = academicStatusSchema.safeParse(raw);
  if (!parsed.success) return getValidationActionState(parsed.error.issues, ACADEMIC_ACTION_FIELDS);

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
  if (error) return error;

  const fallback = getAcademicResourceRoute(context.data.scope, context.data.institutionId, context.data.resource);
  revalidatePath(fallback);
  redirect(getSafeReturnTo(context.data.returnTo, fallback));
}

export async function deleteAcademicResourceAction(
  scope: AcademicScopeType,
  institutionId: string,
  resource:
    | AcademicResource.ACADEMIC_YEAR
    | AcademicResource.TRAINING_PATH
    | AcademicResource.STUDY_PLAN
    | AcademicResource.ACADEMIC_SPACE
    | AcademicResource.INSTRUMENT
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
  if (!context.success) return invalidActionState();

  const permission = restorableResourceSchema.safeParse(context.data.resource).success
    ? DELETE_PERMISSIONS[context.data.resource as LifecycleResource]
    : INSTITUTIONAL_PERMISSION.STUDY_PLAN_CURRICULUM_UPDATE;
  const authError = await authorizeAcademicAction(context.data.scope, context.data.institutionId, permission);
  if (authError) return authError;

  const error = await getResponseErrorActionState(
    academicApiFetch(
      context.data.scope,
      `${getAcademicApiBase(context.data.scope, context.data.institutionId)}/${context.data.resource}/${context.data.id}`,
      { method: "DELETE" },
    ),
    ACADEMIC_ACTION_FIELDS,
    "No se pudo eliminar el elemento.",
  );
  if (error) return error;

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
  if (!context.success) return invalidActionState();

  const authError = await authorizeAcademicAction(context.data.scope, context.data.institutionId, RESTORE_PERMISSIONS[context.data.resource]);
  if (authError) return authError;

  const apiBase = getAcademicApiBase(context.data.scope, context.data.institutionId);
  const error = await getResponseErrorActionState(
    academicApiFetch(context.data.scope, `${apiBase}/${context.data.resource}/${context.data.id}/restore`, {
      method: "POST",
    }),
    ACADEMIC_ACTION_FIELDS,
    "No se pudo restaurar el elemento.",
  );
  if (error) return error;

  const fallback = getAcademicResourceRoute(context.data.scope, context.data.institutionId, context.data.resource);
  revalidatePath(fallback);
  redirect(getSafeReturnTo(context.data.destination, fallback));
}
