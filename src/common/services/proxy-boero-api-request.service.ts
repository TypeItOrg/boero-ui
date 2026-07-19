import { createPassthroughResponse } from "@common/utils/create-passthrough-response.util";
import { getApiUrlOrThrow } from "@common/utils/get-api-url-or-throw.util";
import { getInstitutionalAccessToken } from "@features/institutional-auth/services/get-institutional-access-token.service";
import { getPlatformAccessToken } from "@features/platform-auth/services/get-platform-access-token.service";

const BODY_METHODS = new Set(["DELETE", "PATCH", "POST", "PUT"]);

export async function proxyBoeroApiRequest(pathSegments: string[], request: Request): Promise<Response> {
  const backendUrl = getBackendUrl(pathSegments, request);
  const headers = await getBackendHeaders(request);
  const body = await getRequestBody(request);

  const response = await fetch(backendUrl, {
    body,
    cache: "no-store",
    headers,
    method: request.method,
  });

  return createPassthroughResponse(response);
}

async function getBackendHeaders(request: Request): Promise<Headers> {
  const headers = new Headers();
  const accessToken = await getProxyAccessToken();
  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");

  if (accept) {
    headers.set("Accept", accept);
  }

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return headers;
}

async function getProxyAccessToken(): Promise<string | undefined> {
  const platformToken = await getPlatformAccessToken();
  if (platformToken) return platformToken;

  try {
    return await getInstitutionalAccessToken();
  } catch {
    return undefined;
  }
}

async function getRequestBody(request: Request): Promise<ArrayBuffer | undefined> {
  if (!BODY_METHODS.has(request.method)) return undefined;
  return request.arrayBuffer();
}

function getBackendUrl(pathSegments: string[], request: Request): URL {
  const requestUrl = new URL(request.url);
  const backendPath = pathSegments.map(encodeURIComponent).join("/");
  const backendUrl = new URL(`api/v1/${backendPath}`, getApiUrlOrThrow());

  backendUrl.search = requestUrl.search;

  return backendUrl;
}
