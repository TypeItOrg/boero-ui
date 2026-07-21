jest.mock("@common/services/proxy-boero-api-request.service", () => ({
  proxyBoeroApiRequest: jest.fn(),
}));

import { proxyBoeroApiRequest } from "@common/services/proxy-boero-api-request.service";
import { COMMON_ERROR_MESSAGES } from "@common/constants/error-messages.constants";
import { DELETE, GET, PATCH, POST, PUT } from "@app/api/[...path]/route";

describe("app/api/[...path]/route", () => {
  type RouteHandler = typeof GET;

  const proxyBoeroApiRequestMock = jest.mocked(proxyBoeroApiRequest);
  const request = new Request("https://app.example.test/api/countries", { method: "GET" });

  function callHandler(handler: RouteHandler): ReturnType<RouteHandler> {
    return handler(request, {
      params: Promise.resolve({ path: ["countries"] }),
    });
  }

  beforeEach(() => {
    proxyBoeroApiRequestMock.mockReset();
  });

  it.each([
    ["GET", GET],
    ["POST", POST],
    ["PUT", PUT],
    ["PATCH", PATCH],
    ["DELETE", DELETE],
  ])("delegates %s requests to the proxy service", async (_method, handler) => {
    const response = new Response(JSON.stringify({ ok: true }), { status: 200 });

    proxyBoeroApiRequestMock.mockResolvedValue(response);

    await expect(callHandler(handler)).resolves.toBe(response);

    expect(proxyBoeroApiRequestMock).toHaveBeenCalledWith(["countries"], request);
  });

  it("returns a 500 response when the proxy throws", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    proxyBoeroApiRequestMock.mockRejectedValue(new Error("boom"));

    const response = await callHandler(GET);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ message: COMMON_ERROR_MESSAGES.UNEXPECTED_API_PROXY });
  });
});
