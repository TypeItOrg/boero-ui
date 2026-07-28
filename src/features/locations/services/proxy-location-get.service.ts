import "server-only";

import { createPassthroughResponse } from "@common/utils/create-passthrough-response.util";
import { getApiUrlOrThrow } from "@common/utils/get-api-url-or-throw.util";
import { LOCATION_ERROR_MESSAGES } from "@features/locations/constants/error-messages.constants";

const LOCATION_REQUEST_TIMEOUT_MS = 15_000;

export async function proxyLocationGet(request: Request, backendPath: string): Promise<Response> {
  const backendUrl = new URL(backendPath, getApiUrlOrThrow());
  backendUrl.search = new URL(request.url).search;

  try {
    const response = await fetch(backendUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(LOCATION_REQUEST_TIMEOUT_MS)]),
    });

    return createPassthroughResponse(response);
  } catch {
    return Response.json({ message: LOCATION_ERROR_MESSAGES.LOCATION_SERVICE_UNAVAILABLE }, { status: 503 });
  }
}
