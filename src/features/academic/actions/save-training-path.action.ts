"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { saveAcademicResourceAction, updateAcademicStatusAction } from "@features/academic/actions/academic-resource.action";
import {
  ACADEMIC_ACTION_FIELDS,
  actionContextSchema,
  invalidActionState,
  resolveCatalogStatusChange,
  type ParsedFormData,
  withoutActiveStatus,
} from "@features/academic/config/academic-resource-action.config";
import { parseAcademicForm } from "@features/academic/schemas/academic-form.schema";
import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { TrainingPathSaveProgress } from "@features/academic/types/training-path-save-progress.types";
import { authorizeAcademicAction } from "@features/academic/utils/academic-action-auth.util";
import { getAcademicApiBase, getAcademicResourceRoute, type AcademicScope } from "@features/academic/utils/academic-scope.util";
import { documentRequirementSchema } from "@features/enrollment-applications/schemas/document-requirement.schema";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";

const progressSchema = z.object({
  trainingPathId: z.uuid(),
  requirementIds: z.record(z.uuid(), z.uuid()),
  requirementRevisions: z.record(z.uuid(), z.number().int().min(0)).optional(),
});
const draftsSchema = z.array(documentRequirementSchema.extend({ clientId: z.uuid(), id: z.uuid().nullable(), dirty: z.boolean() }));

export async function saveTrainingPathAction(
  scope: AcademicScope,
  institutionId: string | undefined,
  id: string | undefined,
  returnTo: string,
  previous: AcademicActionState,
  form: FormData,
): Promise<AcademicActionState> {
  const parsedProgress = progressSchema.optional().safeParse(previous.trainingPathProgress);
  if (!parsedProgress.success || (id && parsedProgress.data && id !== parsedProgress.data.trainingPathId)) {
    return invalidActionState();
  }

  let progress: TrainingPathSaveProgress | undefined = parsedProgress.data;
  const withProgress = (state: AcademicActionState): AcademicActionState => ({ ...state, trainingPathProgress: progress });
  if (previous.trainingPathSaveUncertain === true) {
    return withProgress({
      error: "Revisá el trayecto y sus requisitos antes de volver a guardar. No se pudo confirmar el resultado anterior.",
      trainingPathSaveUncertain: true,
    });
  }
  const effectiveId = id ?? progress?.trainingPathId;
  const resolvedInstitutionId = institutionId ?? form.get("institutionId");
  if (institutionId === undefined && !z.uuid().safeParse(resolvedInstitutionId).success) {
    return withProgress({ fieldErrors: { institutionId: "Seleccioná una institución." } });
  }

  const context = actionContextSchema.safeParse({
    scope,
    institutionId: resolvedInstitutionId,
    resource: AcademicResource.TRAINING_PATH,
    id: effectiveId,
    returnTo,
  });
  if (!context.success) {
    return withProgress(invalidActionState());
  }

  let rawDrafts: unknown;
  const rawDocumentRequirements = form.get("documentRequirements");
  if (rawDocumentRequirements !== null && typeof rawDocumentRequirements !== "string") {
    return withProgress({ fieldErrors: { documentRequirements: "Revisá los documentos requeridos para la inscripción." } });
  }
  try {
    rawDrafts = JSON.parse(rawDocumentRequirements ?? "[]");
  } catch {
    return withProgress({ fieldErrors: { documentRequirements: "Revisá los documentos requeridos para la inscripción." } });
  }
  const drafts = draftsSchema.safeParse(rawDrafts);
  if (!drafts.success) {
    return withProgress({ fieldErrors: { documentRequirements: "Revisá los documentos requeridos para la inscripción." } });
  }
  if (new Set(drafts.data.map((draft) => draft.clientId)).size !== drafts.data.length) {
    return withProgress({ fieldErrors: { documentRequirements: "Revisá los documentos requeridos para la inscripción." } });
  }
  const changedDrafts = drafts.data.filter((draft) => draft.dirty);
  if (changedDrafts.length === 0) {
    return withProgress(
      await saveAcademicResourceAction(scope, institutionId, AcademicResource.TRAINING_PATH, effectiveId, undefined, returnTo, previous, form),
    );
  }

  const input = context.data;
  const pathAuthError = await authorizeAcademicAction(
    input.scope,
    input.institutionId,
    effectiveId ? INSTITUTIONAL_PERMISSION.TRAINING_PATH_UPDATE : INSTITUTIONAL_PERMISSION.TRAINING_PATH_CREATE,
  );
  if (pathAuthError) {
    return withProgress(pathAuthError);
  }
  const documentAuthError = await authorizeAcademicAction(input.scope, input.institutionId, INSTITUTIONAL_PERMISSION.TRAINING_PATH_UPDATE);
  if (documentAuthError) {
    return withProgress(documentAuthError);
  }

  const parsed = parseAcademicForm(AcademicResource.TRAINING_PATH, form);
  if (!parsed.success) {
    return withProgress(getValidationActionState(parsed.error.issues, ACADEMIC_ACTION_FIELDS));
  }
  const status = resolveCatalogStatusChange(AcademicResource.TRAINING_PATH, effectiveId, form);
  if (status.error) {
    return withProgress(status.error);
  }
  if (status.nextActiveStatus !== null) {
    const statusAuthError = await authorizeAcademicAction(input.scope, input.institutionId, INSTITUTIONAL_PERMISSION.TRAINING_PATH_STATUS_UPDATE);
    if (statusAuthError) {
      return withProgress(statusAuthError);
    }
  }

  const apiBase = getAcademicApiBase(input.scope, input.institutionId);
  let pathResponse: Response | undefined;
  const pathRequest = academicApiFetch(input.scope, `${apiBase}/training-paths${effectiveId ? `/${effectiveId}` : ""}`, {
    method: effectiveId ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(withoutActiveStatus(parsed.data as ParsedFormData)),
  }).then((response) => {
    pathResponse = response;
    return response;
  });
  const pathError = await getResponseErrorActionState(pathRequest, ACADEMIC_ACTION_FIELDS, "No se pudo guardar el trayecto formativo.");
  if (pathError) {
    if (!effectiveId && (!pathResponse || pathResponse.status >= 500)) {
      return { error: "No se pudo confirmar si el trayecto se creó. Revisá el listado antes de volver a crearlo.", trainingPathSaveUncertain: true };
    }
    return withProgress(pathError);
  }

  let pathId = effectiveId;
  if (!pathId) {
    const created = z.object({ id: z.uuid() }).safeParse(await (await pathRequest).json().catch(() => null));
    if (!created.success) {
      return {
        error: "La API no devolvió el identificador del trayecto. Revisá el listado antes de volver a crearlo.",
        trainingPathSaveUncertain: true,
      };
    }
    pathId = created.data.id;
  }
  progress = { trainingPathId: pathId, requirementIds: { ...progress?.requirementIds }, requirementRevisions: { ...progress?.requirementRevisions } };
  const fallback = getAcademicResourceRoute(input.scope, input.institutionId, AcademicResource.TRAINING_PATH);
  revalidatePath(fallback);
  revalidatePath(`${fallback}/${pathId}`);

  for (const draft of changedDrafts) {
    const requirementId = draft.id ?? progress.requirementIds[draft.clientId];
    let requirementResponse: Response | undefined;
    const request = academicApiFetch(
      input.scope,
      `${apiBase}/training-paths/${pathId}/document-requirements${requirementId ? `/${requirementId}` : ""}`,
      {
        method: requirementId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...documentRequirementSchema.parse(draft),
          revision: progress.requirementRevisions?.[draft.clientId] ?? draft.revision,
        }),
      },
    ).then((response) => {
      requirementResponse = response;
      return response;
    });
    const error = await getResponseErrorActionState(request, [], "No se pudo guardar el requisito documental.");
    if (error) {
      if (!requirementId && (!requirementResponse || requirementResponse.status >= 500)) {
        return withProgress({
          error: `El trayecto se guardó, pero no se pudo confirmar la creación de «${draft.name}». Revisá sus requisitos antes de volver a guardarlo.`,
          trainingPathSaveUncertain: true,
        });
      }
      return withProgress({
        error: `El trayecto se guardó, pero no se pudo guardar «${draft.name}». ${error.error} Podés reintentar desde este formulario.`,
      });
    }
    const saved = z.object({ id: z.uuid(), revision: z.number().int().min(0) }).safeParse(await (await request).json().catch(() => null));
    if (!saved.success) {
      return withProgress({
        error: `La API no devolvió el identificador de «${draft.name}». Revisá los requisitos del trayecto antes de volver a guardarlo.`,
        trainingPathSaveUncertain: true,
      });
    }
    progress.requirementIds[draft.clientId] = saved.data.id;
    progress.requirementRevisions ??= {};
    progress.requirementRevisions[draft.clientId] = saved.data.revision;
  }

  if (status.nextActiveStatus !== null) {
    const statusState = await updateAcademicStatusAction(
      input.scope,
      input.institutionId,
      AcademicResource.TRAINING_PATH,
      pathId,
      input.returnTo,
      {},
      form,
    );
    if (statusState) {
      return withProgress(statusState);
    }
  }

  revalidatePath(fallback);
  revalidatePath(`${fallback}/${pathId}`);
  redirect(getSafeReturnTo(input.returnTo, fallback));
}
