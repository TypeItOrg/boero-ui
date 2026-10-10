import { parseNullableHttpResponse } from "@common/utils/http-response-error.util";

import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";
import type { Institution } from "@features/institutions/types/institution.types";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

export async function fetchInstitution(id: string): Promise<Institution | null> {
  const response = await platformApiFetch(`/api/v1/admin/institutions/${id}`);

  return parseNullableHttpResponse(response, INSTITUTION_ERROR_MESSAGES.FETCH_INSTITUTION);
}
