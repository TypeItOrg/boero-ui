import "server-only";

import { parseHttpResponse } from "@common/utils/http-response-error.util";
import type { PaginationParams } from "@common/types/pagination-params.types";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import type { ActiveSession } from "@features/institutional-auth/types/active-session.types";

const FALLBACK_MESSAGE = "No se pudieron obtener tus sesiones activas.";

export async function fetchInstitutionalSessions(params: PaginationParams): Promise<PaginatedResponse<ActiveSession>> {
  const query = new URLSearchParams({ page: String(params.page), size: String(params.size) });
  const response = await institutionalApiFetch(`/api/v1/auth/sessions?${query.toString()}`);

  return parseHttpResponse<PaginatedResponse<ActiveSession>>(response, FALLBACK_MESSAGE);
}
