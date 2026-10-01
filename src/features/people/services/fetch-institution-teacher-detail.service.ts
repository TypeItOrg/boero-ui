import { parseNullableHttpResponse } from "@common/utils/http-response-error.util";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import { peopleApiFetch } from "@features/people/services/people-api-fetch.service";
import type { TeacherDetail } from "@features/people/types/teacher-detail.types";
import { PeopleScope } from "@features/people/utils/people-scope.util";

export async function fetchInstitutionTeacherDetail(institutionId: string, teacherId: string): Promise<TeacherDetail | null> {
  const response = await peopleApiFetch(PeopleScope.INSTITUTIONAL, `/api/v1/institutions/${institutionId}/teachers/${teacherId}`);
  return parseNullableHttpResponse(response, PEOPLE_ERROR_MESSAGES.FETCH_TEACHERS);
}
