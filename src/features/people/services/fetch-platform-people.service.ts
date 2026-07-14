import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { createHttpError } from "@common/utils/create-http-error.util";
import { buildPaginationSearchParams } from "@common/utils/pagination-query.util";
import { serializeSpringSort } from "@common/utils/sort-query.util";
import type { PlatformPersonSummary } from "@features/people/types/person.types";
import type { PlatformPeoplePaginationParams } from "@features/people/utils/platform-people-pagination.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

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

  const response = await platformApiFetch(`/api/v1/platform/people?${searchParams.toString()}`);
  if (!response.ok) {
    throw createHttpError("No se pudieron obtener los usuarios de la plataforma", response.status);
  }

  return response.json();
}
