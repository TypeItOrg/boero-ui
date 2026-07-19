import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { peopleApiFetch } from "./people-api-fetch.service";
import type { Person } from "../types/person.types";
import { PEOPLE_ERROR_MESSAGES } from "../constants/error-messages.constants";
import type { PeopleScope } from "../utils/people-scope.util";
import { getPeoplePath } from "../utils/people-scope.util";

export async function fetchPerson(
  institutionId: string,
  personId: string,
  scope: PeopleScope = "admin",
): Promise<Person | null> {
  const response = await peopleApiFetch(scope, getPeoplePath(scope, institutionId, personId));

  if (response.status === 404) return null;

  return parseHttpResponse(response, PEOPLE_ERROR_MESSAGES.FETCH_PERSON);
}
