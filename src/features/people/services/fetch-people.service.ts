import { parseHttpResponse } from "@common/utils/http-response-error.util";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { buildPaginationSearchParams } from "@common/utils/pagination-query.util";
import { serializeSpringSort } from "@common/utils/sort-query.util";
import { peopleApiFetch } from "@features/people/services/people-api-fetch.service";
import type { PersonSummary } from "@features/people/types/person.types";
import type { PeoplePaginationParams } from "@features/people/utils/people-pagination.util";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import type { PeopleScope } from "@features/people/utils/people-scope.util";
import { getPeoplePath } from "@features/people/utils/people-scope.util";

export async function fetchPeople(
  institutionId: string,
  params: PeoplePaginationParams,
  scope: PeopleScope = "admin",
): Promise<PaginatedResponse<PersonSummary>> {
  const { page, size, search, sort, roleId } = params;
  const searchParams = buildPaginationSearchParams({ page, size, search });
  searchParams.set("sort", serializeSpringSort(sort));
  if (roleId) {
    searchParams.set("roleId", roleId);
  }

  const response = await peopleApiFetch(scope, `${getPeoplePath(scope, institutionId)}?${searchParams.toString()}`);

  return parseHttpResponse(response, PEOPLE_ERROR_MESSAGES.FETCH_PEOPLE);
}
