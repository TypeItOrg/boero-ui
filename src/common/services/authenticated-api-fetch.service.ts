import "server-only";

import { getApiUrlOrThrow } from "@common/utils/get-api-url-or-throw.util";

const API_REQUEST_TIMEOUT_MS = 15_000;

export function authenticatedApiFetch(
  path: string,
  accessToken: string | undefined,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const timeoutSignal = AbortSignal.timeout(API_REQUEST_TIMEOUT_MS);
  const signal = init.signal ? AbortSignal.any([init.signal, timeoutSignal]) : timeoutSignal;

  return fetch(new URL(path, getApiUrlOrThrow()), {
    ...init,
    cache: "no-store",
    headers,
    signal,
  });
}
