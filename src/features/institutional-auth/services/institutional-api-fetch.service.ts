import "server-only";

import { authenticatedApiFetch } from "@common/services/authenticated-api-fetch.service";
import { getInstitutionalAccessToken } from "@features/institutional-auth/services/get-institutional-access-token.service";

export async function institutionalApiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const accessToken = await getInstitutionalAccessToken();
  return authenticatedApiFetch(path, accessToken, init);
}
