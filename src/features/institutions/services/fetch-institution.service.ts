import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import type { Institution } from "@features/institutions/types/institution.types";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";

export async function fetchInstitution(id: string): Promise<Institution | null> {
  const response = await platformApiFetch(`/api/v1/admin/institutions/${id}`);

  if (!response.ok) return null;

  return parseHttpResponse(response, INSTITUTION_ERROR_MESSAGES.FETCH_INSTITUTION);
}
