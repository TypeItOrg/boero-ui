import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { peopleApiFetch } from "@features/people/services/people-api-fetch.service";
import type { Person } from "@features/people/types/person.types";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import type { PeopleScope } from "@features/people/utils/people-scope.util";
import { getPeoplePath } from "@features/people/utils/people-scope.util";

export async function fetchPerson(
  institutionId: string,
  personId: string,
  scope: PeopleScope = "admin",
): Promise<Person | null> {
  const response = await peopleApiFetch(scope, getPeoplePath(scope, institutionId, personId));

  if (!response.ok) return null;

  return parseHttpResponse(response, PEOPLE_ERROR_MESSAGES.FETCH_PERSON);
}
