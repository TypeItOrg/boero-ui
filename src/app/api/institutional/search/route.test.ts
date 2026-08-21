jest.mock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({
  institutionalApiFetch: jest.fn(),
}));

import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { GET } from "./route";

describe("GET /api/institutional/search", () => {
  const institutionalApiFetchMock = jest.mocked(institutionalApiFetch);
  const institutionId = "019848b9-2e20-7a11-992a-87e71b86ce6b";

  beforeEach(() => institutionalApiFetchMock.mockReset());

  it("rejects an invalid institution identifier", async () => {
    const response = await GET(new Request("http://localhost/api/institutional/search?institutionId=invalid&search=rol"));

    expect(response.status).toBe(400);
    expect(institutionalApiFetchMock).not.toHaveBeenCalled();
  });

  it("forwards only validated values to the scoped backend endpoint", async () => {
    institutionalApiFetchMock.mockResolvedValue(Response.json({ groups: [] }));
    const request = new Request(`http://localhost/api/institutional/search?institutionId=${institutionId}&search=rol&limit=4`);

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(institutionalApiFetchMock).toHaveBeenCalledWith(`/api/v1/institutions/${institutionId}/search?search=rol&limit=4`, {
      signal: request.signal,
    });
  });

  it("preserves backend authorization failures", async () => {
    institutionalApiFetchMock.mockResolvedValue(
      Response.json({ message: "No autorizado." }, { status: 401, headers: { "x-request-id": "request-institutional-search" } }),
    );
    const response = await GET(new Request(`http://localhost/api/institutional/search?institutionId=${institutionId}&search=rol`));

    expect(response.status).toBe(401);
    expect(response.headers.get("x-request-id")).toBe("request-institutional-search");
    await expect(response.json()).resolves.toEqual({ message: "No autorizado." });
  });

  it("maps transport failures to service unavailable", async () => {
    institutionalApiFetchMock.mockRejectedValue(new Error("network error"));
    const response = await GET(new Request(`http://localhost/api/institutional/search?institutionId=${institutionId}&search=rol`));

    expect(response.status).toBe(503);
  });
});
