import { LOCATION_ERROR_MESSAGES } from "@features/locations/constants/error-messages.constants";
import { proxyLocationGet } from "@features/locations/services/proxy-location-get.service";

describe("proxyLocationGet", () => {
  const request = new Request("https://app.example.test/api/countries?page=2&size=20&search=arg");

  it("forwards the query with the location request policy", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue(Response.json({ items: [] }));

    const response = await proxyLocationGet(request, "/api/v1/countries");

    expect(fetchMock).toHaveBeenCalledWith(
      new URL("http://localhost:8080/api/v1/countries?page=2&size=20&search=arg"),
      expect.objectContaining({
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: expect.any(AbortSignal),
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ items: [] });
  });

  it("returns JSON when the backend is unavailable", async () => {
    jest.spyOn(global, "fetch").mockRejectedValue(new Error("unavailable"));

    const response = await proxyLocationGet(request, "/api/v1/countries");

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      message: LOCATION_ERROR_MESSAGES.LOCATION_SERVICE_UNAVAILABLE,
    });
  });
});
