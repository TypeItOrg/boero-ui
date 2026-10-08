import { z } from "zod";

import { getResponseErrorActionState } from "@common/utils/action-state.util";

import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import type { TrainingPathDocumentDraft } from "@features/academic/types/training-path-document-draft.types";
import type { TrainingPathSaveProgress } from "@features/academic/types/training-path-save-progress.types";
import { type AcademicScope } from "@features/academic/utils/academic-scope.util";
import { documentRequirementSchema } from "@features/enrollment-applications/schemas/document-requirement.schema";

export async function saveTrainingPathRequirements(
  scope: AcademicScope,
  apiBase: string,
  pathId: string,
  changedDrafts: readonly TrainingPathDocumentDraft[],
  progress: TrainingPathSaveProgress,
): Promise<AcademicActionState | undefined> {
  for (const draft of changedDrafts) {
    const requirementId = draft.id ?? progress.requirementIds[draft.clientId];
    let requirementResponse: Response | undefined;

    const request = academicApiFetch(scope, `${apiBase}/training-paths/${pathId}/document-requirements${requirementId ? `/${requirementId}` : ""}`, {
      method: requirementId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...documentRequirementSchema.parse(draft),
        revision: progress.requirementRevisions?.[draft.clientId] ?? draft.revision,
      }),
    }).then((response) => {
      requirementResponse = response;

      return response;
    });

    const error = await getResponseErrorActionState(request, [], "No se pudo guardar el requisito documental.");

    if (error) {
      if (!requirementId && (!requirementResponse || requirementResponse.status >= 500)) {
        return {
          error: `El trayecto se guardó, pero no se pudo confirmar la creación de «${draft.name}». Revisá sus requisitos antes de volver a guardarlo.`,
          trainingPathSaveUncertain: true,
        };
      }

      return {
        error: `El trayecto se guardó, pero no se pudo guardar «${draft.name}». ${error.error} Podés reintentar desde este formulario.`,
      };
    }

    const saved = z.object({ id: z.uuid(), revision: z.number().int().min(0) }).safeParse(await (await request).json().catch(() => null));

    if (!saved.success) {
      return {
        error: `La API no devolvió el identificador de «${draft.name}». Revisá los requisitos del trayecto antes de volver a guardarlo.`,
        trainingPathSaveUncertain: true,
      };
    }

    progress.requirementIds[draft.clientId] = saved.data.id;
    progress.requirementRevisions ??= {};
    progress.requirementRevisions[draft.clientId] = saved.data.revision;
  }

  return undefined;
}
