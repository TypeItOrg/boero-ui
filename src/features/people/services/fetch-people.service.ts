import { parseHttpResponse } from "@common/utils/http-response-error.util";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { buildPaginationSearchParams } from "@common/utils/pagination-query.util";
import { serializeSpringSort } from "@common/utils/sort-query.util";
import { peopleApiFetch } from "./people-api-fetch.service";
import type { PersonSummary } from "../types/person.types";
import type { PeoplePaginationParams } from "../utils/people-pagination.util";
import { PEOPLE_ERROR_MESSAGES } from "../constants/error-messages.constants";
import type { PeopleScope } from "../utils/people-scope.util";
import { getPeoplePath } from "../utils/people-scope.util";

export async function fetchPeople(
  institutionId: string,
  params: PeoplePaginationParams,
  scope: PeopleScope = "admin",
): Promise<PaginatedResponse<PersonSummary>> {
  const { page, size, search, sort } = params;
  const searchParams = buildPaginationSearchParams({ page, size, search });
  searchParams.set("sort", serializeSpringSort(sort));

  const response = await peopleApiFetch(scope, `${getPeoplePath(scope, institutionId)}?${searchParams.toString()}`);

  return parseHttpResponse(response, PEOPLE_ERROR_MESSAGES.FETCH_PEOPLE);
}
