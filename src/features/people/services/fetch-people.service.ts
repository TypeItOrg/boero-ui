import { createHttpError } from "@common/utils/create-http-error.util";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { buildPaginationSearchParams } from "@common/utils/pagination-query.util";
import { serializeSpringSort } from "@common/utils/sort-query.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import type { PersonSummary } from "../types/person.types";
import type { PeoplePaginationParams } from "../utils/people-pagination.util";

export async function fetchPeople(
  institutionId: string,
  params: PeoplePaginationParams,
): Promise<PaginatedResponse<PersonSummary>> {
  const { page, size, search, sort } = params;
  const searchParams = buildPaginationSearchParams({ page, size, search });
  searchParams.set("sort", serializeSpringSort(sort));

  const response = await platformApiFetch(`/api/v1/institutions/${institutionId}/people?${searchParams.toString()}`);

  if (!response.ok) {
    throw createHttpError("No se pudieron obtener los usuarios de la institución", response.status);
  }

  return response.json();
}
