"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { z } from "zod";

import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { getSafeReturnTo } from "@common/utils/return-to.util";

import { updateAcademicStatusAction } from "@features/academic/actions/update-academic-status.action";
import {
  ACADEMIC_ACTION_FIELDS,
  RESOURCE_ACTION_CONFIG,
  STATUS_PERMISSIONS,
  actionContextSchema,
  invalidActionState,
  resolveCatalogStatusChange,
  type ParsedFormData,
} from "@features/academic/config/academic-resource-action.config";
import { parseAcademicForm } from "@features/academic/schemas/academic-form.schema";
import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { authorizeAcademicAction } from "@features/academic/utils/academic-action-auth.util";
import { getAcademicApiBase, getAcademicResourceRoute, type AcademicScope as AcademicScopeType } from "@features/academic/utils/academic-scope.util";

export async function saveAcademicResourceAction(
  scope: AcademicScopeType,
  institutionId: string | undefined,
  resource: AcademicResource,
  id: string | undefined,
  parentId: string | undefined,
  returnTo: string | undefined,
  _state: AcademicActionState,
  formData: FormData,
): Promise<AcademicActionState> {
  const resolvedInstitutionId = institutionId ?? formData.get("institutionId");

  if (institutionId === undefined && !z.uuid().safeParse(resolvedInstitutionId).success) {
    return { fieldErrors: { institutionId: "Seleccioná una institución." } };
  }

  const context = actionContextSchema.safeParse({
    scope,
    institutionId: resolvedInstitutionId,
    resource,
    id,
    parentId,
    returnTo,
  });

  if (!context.success) {
    return invalidActionState();
  }

  const config = RESOURCE_ACTION_CONFIG[context.data.resource];
  const requiredPermission = context.data.id ? config.updatePermission : config.createPermission;
  const authError = await authorizeAcademicAction(context.data.scope, context.data.institutionId, requiredPermission);

  if (authError) {
    return authError;
  }

  const catalogStatus = resolveCatalogStatusChange(context.data.resource, context.data.id, formData);

  if (catalogStatus.error) {
    return catalogStatus.error;
  }

  if (catalogStatus.nextActiveStatus !== null && catalogStatus.formStatusResource) {
    const statusAuthError = await authorizeAcademicAction(
      context.data.scope,
      context.data.institutionId,
      STATUS_PERMISSIONS[catalogStatus.formStatusResource],
    );

    if (statusAuthError) {
      return statusAuthError;
    }
  }

  const parsed = parseAcademicForm(context.data.resource, formData);

  if (!parsed.success) {
    return getValidationActionState(parsed.error.issues, ACADEMIC_ACTION_FIELDS);
  }

  const data = parsed.data as ParsedFormData;

  if (context.data.resource === AcademicResource.STUDY_PLAN && context.data.id && data.status) {
    const statusAuthError = await authorizeAcademicAction(
      context.data.scope,
      context.data.institutionId,
      STATUS_PERMISSIONS[AcademicResource.STUDY_PLAN],
    );

    if (statusAuthError) {
      return statusAuthError;
    }
  }

  const apiBase = getAcademicApiBase(context.data.scope, context.data.institutionId);

  const path = context.data.id
    ? (config.updatePath?.(apiBase, context.data.id) ?? `${apiBase}/${context.data.resource}/${context.data.id}`)
    : config.createPath(apiBase, context.data.parentId, data);

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

  if (error) {
    return error;
  }

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

    if (statusState) {
      return statusState;
    }
  }

  if (context.data.resource === AcademicResource.STUDY_PLAN && context.data.id && data.status) {
    const statusState = await updateAcademicStatusAction(
      context.data.scope,
      context.data.institutionId,
      AcademicResource.STUDY_PLAN,
      context.data.id,
      context.data.returnTo,
      {},
      formData,
    );

    if (statusState) {
      return statusState;
    }
  }

  const fallback = getAcademicResourceRoute(context.data.scope, context.data.institutionId, context.data.resource);

  revalidatePath(fallback);
  redirect(getSafeReturnTo(context.data.returnTo, fallback));
}
