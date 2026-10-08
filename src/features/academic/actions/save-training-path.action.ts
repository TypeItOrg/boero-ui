"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { z } from "zod";

import { getValidationActionState } from "@common/utils/action-state.util";
import { getSafeReturnTo } from "@common/utils/return-to.util";

import { saveAcademicResourceAction } from "@features/academic/actions/academic-resource.action";
import { updateAcademicStatusAction } from "@features/academic/actions/update-academic-status.action";
import {
  ACADEMIC_ACTION_FIELDS,
  actionContextSchema,
  invalidActionState,
  resolveCatalogStatusChange,
  type ParsedFormData,
} from "@features/academic/config/academic-resource-action.config";
import { parseAcademicForm } from "@features/academic/schemas/academic-form.schema";
import { progressSchema } from "@features/academic/schemas/training-path-save.schema";
import { saveTrainingPathRecord } from "@features/academic/services/save-training-path-record.service";
import { saveTrainingPathRequirements } from "@features/academic/services/save-training-path-requirements.service";
import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { TrainingPathSaveProgress } from "@features/academic/types/training-path-save-progress.types";
import { authorizeAcademicAction } from "@features/academic/utils/academic-action-auth.util";
import { getAcademicApiBase, getAcademicResourceRoute, type AcademicScope } from "@features/academic/utils/academic-scope.util";
import { parseTrainingPathRequirements } from "@features/academic/utils/parse-training-path-requirements.util";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";

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

  const withProgress = (state: AcademicActionState): AcademicActionState => ({
    ...state,
    trainingPathProgress: progress,
  });

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

  const drafts = parseTrainingPathRequirements(form);

  if (!drafts.success) {
    return withProgress(drafts.state);
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
  const record = await saveTrainingPathRecord(input.scope, apiBase, effectiveId, parsed.data as ParsedFormData, withProgress);

  if (!record.success) {
    return record.state;
  }

  const pathId = record.pathId;

  progress = {
    trainingPathId: pathId,
    requirementIds: { ...progress?.requirementIds },
    requirementRevisions: { ...progress?.requirementRevisions },
  };

  const fallback = getAcademicResourceRoute(input.scope, input.institutionId, AcademicResource.TRAINING_PATH);

  revalidatePath(fallback);
  revalidatePath(`${fallback}/${pathId}`);

  const requirementError = await saveTrainingPathRequirements(input.scope, apiBase, pathId, changedDrafts, progress);

  if (requirementError) {
    return withProgress(requirementError);
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
