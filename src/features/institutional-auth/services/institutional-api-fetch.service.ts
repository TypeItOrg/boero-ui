import "server-only";

import { getApiUrlOrThrow } from "@common/utils/get-api-url-or-throw.util";
import { getInstitutionalAccessToken } from "@features/institutional-auth/services/get-institutional-access-token.service";

export async function institutionalApiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const accessToken = await getInstitutionalAccessToken();

  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  return fetch(new URL(path, getApiUrlOrThrow()), {
    cache: "no-store",
    ...init,
    headers,
  });
}
