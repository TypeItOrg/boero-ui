import { createPassthroughResponse } from "@common/utils/create-passthrough-response.util";
import { getApiUrlOrThrow } from "@common/utils/get-api-url-or-throw.util";

export async function GET(request: Request): Promise<Response> {
  const backendUrl = new URL("/api/v1/institutions", getApiUrlOrThrow());
  backendUrl.search = new URL(request.url).search;

  const response = await fetch(backendUrl, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  return createPassthroughResponse(response);
}
