import "server-only";

import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import type { TrainingPath } from "@features/academic/types/training-path.types";

const FALLBACK_MESSAGE = "No se pudieron cargar los trayectos formativos disponibles.";

export async function fetchEnrollmentApplicationTrainingPaths(applicationId: string): Promise<TrainingPath[]> {
  const response = await institutionalApiFetch(`/api/v1/enrollment-applications/${applicationId}/training-paths`);
  return parseHttpResponse<TrainingPath[]>(response, FALLBACK_MESSAGE);
}
