import { z } from "zod";

import { getResponseErrorActionState } from "@common/utils/action-state.util";

import { ACADEMIC_ACTION_FIELDS, withoutActiveStatus, type ParsedFormData } from "@features/academic/config/academic-resource-action.config";
import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import type { TrainingPathRecordSaveResult } from "@features/academic/types/training-path-record-save-result.types";
import { type AcademicScope } from "@features/academic/utils/academic-scope.util";

export async function saveTrainingPathRecord(
  scope: AcademicScope,
  apiBase: string,
  effectiveId: string | undefined,
  data: ParsedFormData,
  withProgress: (state: AcademicActionState) => AcademicActionState,
): Promise<TrainingPathRecordSaveResult> {
  let pathResponse: Response | undefined;

  const pathRequest = academicApiFetch(scope, `${apiBase}/training-paths${effectiveId ? `/${effectiveId}` : ""}`, {
    method: effectiveId ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(withoutActiveStatus(data)),
  }).then((response) => {
    pathResponse = response;

    return response;
  });

  const pathError = await getResponseErrorActionState(pathRequest, ACADEMIC_ACTION_FIELDS, "No se pudo guardar el trayecto formativo.");

  if (pathError) {
    if (!effectiveId && (!pathResponse || pathResponse.status >= 500)) {
      return {
        success: false,
        state: {
          error: "No se pudo confirmar si el trayecto se creó. Revisá el listado antes de volver a crearlo.",
          trainingPathSaveUncertain: true,
        },
      };
    }

    return { success: false, state: withProgress(pathError) };
  }

  let pathId = effectiveId;

  if (!pathId) {
    const created = z.object({ id: z.uuid() }).safeParse(await (await pathRequest).json().catch(() => null));

    if (!created.success) {
      return {
        success: false,
        state: {
          error: "La API no devolvió el identificador del trayecto. Revisá el listado antes de volver a crearlo.",
          trainingPathSaveUncertain: true,
        },
      };
    }

    pathId = created.data.id;
  }

  return { success: true, pathId };
}
