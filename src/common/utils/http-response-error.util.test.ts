import { HttpResponseError, isHttpResponseError, parseHttpResponse } from "@common/utils/http-response-error.util";

describe("http response errors", () => {
  it("parses successful JSON responses", async () => {
    const response = Response.json({ value: "ok" });

    await expect(parseHttpResponse<{ value: string }>(response, "Fallback")).resolves.toEqual({ value: "ok" });
  });

  it("throws an HttpResponseError for unsuccessful responses", async () => {
    const response = Response.json({ message: "El backend no está disponible." }, { status: 503, headers: { "X-Request-Id": "request-123" } });

    await expect(parseHttpResponse(response, "Service unavailable")).rejects.toEqual(
      new HttpResponseError("El backend no está disponible.", 503, "request-123"),
    );
  });

  it("uses the fallback for malformed error payloads", async () => {
    const response = new Response("not-json", { status: 502 });

    await expect(parseHttpResponse(response, "Respuesta inválida")).rejects.toEqual(new HttpResponseError("Respuesta inválida", 502));
  });

  it("matches only the requested HttpResponseError status", () => {
    const error = new HttpResponseError("Unauthorized", 401);

    expect(isHttpResponseError(error)).toBe(true);
    expect(isHttpResponseError(error, 401)).toBe(true);
    expect(isHttpResponseError(error, 404)).toBe(false);
    expect(isHttpResponseError(new Error("401"), 401)).toBe(false);
  });
});
