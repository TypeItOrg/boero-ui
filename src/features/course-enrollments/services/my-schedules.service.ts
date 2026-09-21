import "server-only";

import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import type { OwnWeeklySchedules } from "@features/course-enrollments/types/own-weekly-schedules.types";

export async function fetchMyWeeklySchedules(institutionId: string, week: string): Promise<OwnWeeklySchedules> {
  const params = new URLSearchParams({ week });
  const response = await institutionalApiFetch(`/api/v1/institutions/${institutionId}/course-enrollments/mine/schedules?${params}`);

  return parseHttpResponse(response, "No se pudieron obtener tus horarios.");
}
