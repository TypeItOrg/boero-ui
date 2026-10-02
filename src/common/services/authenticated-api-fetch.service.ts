import "server-only";

import { publicApiFetch } from "@common/services/public-api-fetch.service";

export function authenticatedApiFetch(path: string, accessToken: string | undefined, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return publicApiFetch(path, { ...init, headers });
}
