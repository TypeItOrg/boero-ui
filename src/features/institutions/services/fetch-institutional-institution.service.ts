import { parseNullableHttpResponse } from "@common/utils/http-response-error.util";
import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import type { Institution } from "@features/institutions/types/institution.types";

export async function fetchInstitutionalInstitution(institutionId: string): Promise<Institution | null> {
  const response = await institutionalApiFetch(`/api/v1/institutions/${institutionId}`);

  return parseNullableHttpResponse(response, INSTITUTION_ERROR_MESSAGES.FETCH_INSTITUTION);
}
