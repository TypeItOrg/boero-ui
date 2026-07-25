import { createPassthroughResponse } from "@common/utils/create-passthrough-response.util";
import { getApiUrlOrThrow } from "@common/utils/get-api-url-or-throw.util";
import { getPlatformAccessToken } from "@features/platform-auth/services/get-platform-access-token.service";

export async function GET(request: Request): Promise<Response> {
  const accessToken = await getPlatformAccessToken();
  if (!accessToken) return Response.json({ message: "No autenticado." }, { status: 401 });

  const backendUrl = new URL("/api/v1/admin/institutions", getApiUrlOrThrow());
  backendUrl.search = new URL(request.url).search;

  const response = await fetch(backendUrl, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  return createPassthroughResponse(response);
}
