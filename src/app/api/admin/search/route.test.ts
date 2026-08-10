jest.mock("@features/platform-auth/services/platform-api-fetch.service", () => ({
  platformApiFetch: jest.fn(),
}));

import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import { GET } from "./route";

describe("GET /api/admin/search", () => {
  const platformApiFetchMock = jest.mocked(platformApiFetch);

  beforeEach(() => platformApiFetchMock.mockReset());

  it("rejects searches shorter than two characters", async () => {
    const response = await GET(new Request("http://localhost/api/admin/search?search=a"));

    expect(response.status).toBe(400);
    expect(platformApiFetchMock).not.toHaveBeenCalled();
  });

  it("forwards a validated search through the authenticated transport", async () => {
    platformApiFetchMock.mockResolvedValue(Response.json({ groups: [] }));
    const request = new Request("http://localhost/api/admin/search?search=Mat%C3%ADas&limit=5");

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(platformApiFetchMock).toHaveBeenCalledWith("/api/v1/admin/search?search=Mat%C3%ADas&limit=5", {
      signal: request.signal,
    });
  });

  it("preserves backend authorization failures", async () => {
    platformApiFetchMock.mockResolvedValue(
      Response.json(
        { message: "No autorizado." },
        { status: 401, headers: { "x-request-id": "request-platform-search" } },
      ),
    );

    const response = await GET(new Request("http://localhost/api/admin/search?search=admin"));

    expect(response.status).toBe(401);
    expect(response.headers.get("x-request-id")).toBe("request-platform-search");
    await expect(response.json()).resolves.toEqual({ message: "No autorizado." });
  });

  it("maps transport failures to service unavailable", async () => {
    platformApiFetchMock.mockRejectedValue(new Error("network error"));

    const response = await GET(new Request("http://localhost/api/admin/search?search=admin"));

    expect(response.status).toBe(503);
  });
});
