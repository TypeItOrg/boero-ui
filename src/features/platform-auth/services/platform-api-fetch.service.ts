import "server-only";

import { authenticatedApiFetch } from "@common/services/authenticated-api-fetch.service";
import { getPlatformAccessToken } from "@features/platform-auth/services/get-platform-access-token.service";

export async function platformApiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const accessToken = await getPlatformAccessToken();
  return authenticatedApiFetch(path, accessToken, init);
}
