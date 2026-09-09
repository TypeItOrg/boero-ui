import "server-only";

import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import type { StudyPlanSpace } from "@features/academic/types/study-plan-space.types";

const FALLBACK_MESSAGE = "No se pudieron cargar los espacios academicos disponibles.";

export async function fetchEnrollmentApplicationStudyPlanSpaces(applicationId: string): Promise<StudyPlanSpace[]> {
  const response = await institutionalApiFetch(`/api/v1/enrollment-applications/${applicationId}/study-plan-spaces`);
  return parseHttpResponse<StudyPlanSpace[]>(response, FALLBACK_MESSAGE);
}
