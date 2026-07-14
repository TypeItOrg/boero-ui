import "server-only";

import { getApiUrlOrThrow } from "@common/utils/get-api-url-or-throw.util";
import { getPlatformAccessToken } from "@features/platform-auth/services/get-platform-access-token.service";

export async function platformApiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const accessToken = await getPlatformAccessToken();

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return fetch(new URL(path, getApiUrlOrThrow()), {
    cache: "no-store",
    ...init,
    headers,
  });
}
