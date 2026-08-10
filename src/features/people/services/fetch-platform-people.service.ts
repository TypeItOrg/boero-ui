import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { buildPaginationSearchParams } from "@common/utils/pagination-query.util";
import { serializeSpringSort } from "@common/utils/sort-query.util";
import type { PlatformPersonSummary } from "@features/people/types/platform-person-summary.types";
import type { PlatformPeoplePaginationParams } from "@features/people/utils/platform-people-pagination.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";

export async function fetchPlatformPeople({
  page,
  size,
  search,
  institutionId,
  roleCode,
  sort,
}: PlatformPeoplePaginationParams): Promise<PaginatedResponse<PlatformPersonSummary>> {
  const searchParams = buildPaginationSearchParams({ page, size, search });
  searchParams.set("sort", serializeSpringSort(sort));

  if (institutionId) searchParams.set("institutionId", institutionId);
  if (roleCode) searchParams.set("roleCode", roleCode);

  const response = await platformApiFetch(`/api/v1/admin/people?${searchParams.toString()}`);
  return parseHttpResponse(response, PEOPLE_ERROR_MESSAGES.FETCH_PLATFORM_PEOPLE);
}
