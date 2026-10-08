import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { buildPaginationSearchParams } from "@common/utils/pagination-query.util";
import { serializeSpringSort } from "@common/utils/sort-query.util";

import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";
import type { InstitutionSummary } from "@features/institutions/types/institution-summary.types";
import type { InstitutionPaginationParams } from "@features/institutions/utils/institution-pagination.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

export async function fetchInstitutions({
  page,
  size,
  search,
  active,
  sort,
}: InstitutionPaginationParams): Promise<PaginatedResponse<InstitutionSummary>> {
  const searchParams = buildPaginationSearchParams({ page, size, search });
  searchParams.set("sort", serializeSpringSort(sort));

  if (active !== undefined) {
    searchParams.set("active", String(active));
  }

  const response = await platformApiFetch(`/api/v1/admin/institutions?${searchParams.toString()}`);

  return parseHttpResponse(response, INSTITUTION_ERROR_MESSAGES.FETCH_INSTITUTIONS);
}
