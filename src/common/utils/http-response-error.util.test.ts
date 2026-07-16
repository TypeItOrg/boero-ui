import { HttpResponseError, isHttpResponseError, parseHttpResponse } from "@common/utils/http-response-error.util";

describe("http response errors", () => {
  it("parses successful JSON responses", async () => {
    const response = Response.json({ value: "ok" });

    await expect(parseHttpResponse<{ value: string }>(response, "Fallback")).resolves.toEqual({ value: "ok" });
  });

  it("throws an HttpResponseError for unsuccessful responses", async () => {
    const response = new Response(null, { status: 503 });

    await expect(parseHttpResponse(response, "Service unavailable")).rejects.toEqual(
      new HttpResponseError("Service unavailable", 503),
    );
  });

  it("matches only the requested HttpResponseError status", () => {
    const error = new HttpResponseError("Unauthorized", 401);

    expect(isHttpResponseError(error)).toBe(true);
    expect(isHttpResponseError(error, 401)).toBe(true);
    expect(isHttpResponseError(error, 404)).toBe(false);
    expect(isHttpResponseError(new Error("401"), 401)).toBe(false);
  });
});
