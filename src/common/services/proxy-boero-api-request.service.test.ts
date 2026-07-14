jest.mock("@features/platform-auth/services/get-platform-access-token.service", () => ({
  getPlatformAccessToken: jest.fn(),
}));

import { getPlatformAccessToken } from "@features/platform-auth/services/get-platform-access-token.service";
import { proxyBoeroApiRequest } from "@common/services/proxy-boero-api-request.service";

describe("proxyBoeroApiRequest", () => {
  const originalApiUrl = process.env.BOERO_API_URL;
  const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();
  const getPlatformAccessTokenMock = jest.mocked(getPlatformAccessToken);

  function getFetchInit(): RequestInit {
    return fetchMock.mock.calls[0]?.[1] as RequestInit;
  }

  function getFetchHeaders(): Headers {
    return getFetchInit().headers as Headers;
  }

  beforeEach(() => {
    process.env.BOERO_API_URL = "https://api.example.test";
    global.fetch = fetchMock;
    getPlatformAccessTokenMock.mockReset();
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  afterAll(() => {
    process.env.BOERO_API_URL = originalApiUrl;
  });

  it("forwards GET requests without body and with auth headers", async () => {
    getPlatformAccessTokenMock.mockResolvedValue("access-token");
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
      }),
    );

    const request = new Request("https://app.example.test/api/users/123?x=1", {
      headers: {
        accept: "application/json",
      },
      method: "GET",
    });

    const response = await proxyBoeroApiRequest(["users", "123"], request);

    expect(fetchMock).toHaveBeenCalledWith(new URL("api/v1/users/123?x=1", "https://api.example.test"), {
      body: undefined,
      cache: "no-store",
      headers: expect.any(Headers),
      method: "GET",
    });

    expect(getFetchHeaders().get("Accept")).toBe("application/json");
    expect(getFetchHeaders().get("Authorization")).toBe("Bearer access-token");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("forwards request bodies for mutating methods", async () => {
    getPlatformAccessTokenMock.mockResolvedValue(undefined);
    fetchMock.mockResolvedValue(
      new Response("created", {
        status: 201,
        statusText: "Created",
        headers: { "content-type": "text/plain" },
      }),
    );

    const request = new Request("https://app.example.test/api/users", {
      body: JSON.stringify({ name: "Matias" }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });

    const response = await proxyBoeroApiRequest(["users"], request);
    const init = getFetchInit();

    expect(fetchMock).toHaveBeenCalledWith(new URL("api/v1/users", "https://api.example.test"), {
      body: expect.any(ArrayBuffer),
      cache: "no-store",
      headers: expect.any(Headers),
      method: "POST",
    });
    expect(Buffer.from(init.body as ArrayBuffer).toString("utf8")).toBe('{"name":"Matias"}');
    expect(getFetchHeaders().get("Content-Type")).toBe("application/json");
    expect(getFetchHeaders().get("Authorization")).toBeNull();
    expect(response.status).toBe(201);
    await expect(response.text()).resolves.toBe("created");
  });
});
