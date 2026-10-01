import { parseHttpResponse } from "@common/utils/http-response-error.util";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { buildPaginationSearchParams } from "@common/utils/pagination-query.util";
import { serializeSpringSort } from "@common/utils/sort-query.util";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import { peopleApiFetch } from "@features/people/services/people-api-fetch.service";
import type { PersonSummary } from "@features/people/types/person-summary.types";
import { PeopleScope } from "@features/people/utils/people-scope.util";
import type { TeachersPaginationParams } from "@features/people/utils/teachers-pagination.util";

export async function fetchInstitutionTeachers(institutionId: string, params: TeachersPaginationParams): Promise<PaginatedResponse<PersonSummary>> {
  const { page, size, search, sort } = params;
  const searchParams = buildPaginationSearchParams({ page, size, search });
  searchParams.set("sort", serializeSpringSort(sort));

  const response = await peopleApiFetch(PeopleScope.INSTITUTIONAL, `/api/v1/institutions/${institutionId}/teachers?${searchParams.toString()}`);

  return parseHttpResponse(response, PEOPLE_ERROR_MESSAGES.FETCH_TEACHERS);
}
