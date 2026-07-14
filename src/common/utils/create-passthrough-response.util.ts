export async function createPassthroughResponse(response: Response): Promise<Response> {
  const body = await response.text();
  const contentType = response.headers.get("content-type") ?? "application/json";

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      "content-type": contentType,
    },
  });
}
