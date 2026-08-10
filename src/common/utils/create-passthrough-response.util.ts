export async function createPassthroughResponse(response: Response): Promise<Response> {
  const body = await response.text();
  const contentType = response.headers.get("content-type") ?? "application/json";
  const headers = new Headers({ "content-type": contentType });
  const requestId = response.headers.get("x-request-id");
  if (requestId) headers.set("x-request-id", requestId);

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
