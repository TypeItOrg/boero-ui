import { NextRequest, type NextResponse } from "next/server";

import {
  PLATFORM_ACCESS_TOKEN_COOKIE,
  PLATFORM_REFRESH_TOKEN_COOKIE,
} from "@features/platform-auth/utils/platform-auth-cookies.util";
import { proxy } from "./proxy";

describe("proxy", () => {
  const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();
  const originalApiUrl = process.env.BOERO_API_URL;

  function createRequest(path: string, cookie: string): NextRequest {
    return new NextRequest(`https://app.example.test${path}`, {
      headers: { cookie },
    });
  }

  function expectPlatformLoginRedirect(response: NextResponse): void {
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://app.example.test/auth/platform/login?next=%2Fplatform%2Forders%3Fpage%3D2",
    );
    expect(response.cookies.get(PLATFORM_ACCESS_TOKEN_COOKIE)?.value).toBe("");
    expect(response.cookies.get(PLATFORM_REFRESH_TOKEN_COOKIE)?.value).toBe("");
  }

  beforeEach(() => {
    process.env.BOERO_API_URL = "https://api.example.test";
    global.fetch = fetchMock;
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  afterAll(() => {
    process.env.BOERO_API_URL = originalApiUrl;
  });

  it("allows platform routes when an access token cookie is present", async () => {
    const request = createRequest("/platform", `${PLATFORM_ACCESS_TOKEN_COOKIE}=access-token`);

    const response = await proxy(request);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("refreshes tokens and continues when the refresh token is valid", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          tokens: {
            accessToken: "new-access-token",
            refreshToken: "new-refresh-token",
          },
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    const request = createRequest("/platform/orders?page=2", `${PLATFORM_REFRESH_TOKEN_COOKIE}=refresh-token`);

    const response = await proxy(request);

    expect(fetchMock).toHaveBeenCalledWith(new URL("/api/v1/auth/platform/refresh", "https://api.example.test"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: "refresh-token" }),
    });
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.cookies.get(PLATFORM_ACCESS_TOKEN_COOKIE)?.value).toBe("new-access-token");
    expect(response.cookies.get(PLATFORM_REFRESH_TOKEN_COOKIE)?.value).toBe("new-refresh-token");
  });

  it("redirects to login when refresh returns no usable tokens", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ tokens: {} }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const request = createRequest("/platform/orders?page=2", `${PLATFORM_REFRESH_TOKEN_COOKIE}=refresh-token`);

    const response = await proxy(request);

    expectPlatformLoginRedirect(response);
  });

  it("redirects to login when refresh throws", async () => {
    fetchMock.mockRejectedValue(new Error("network"));

    const request = createRequest("/platform/orders?page=2", `${PLATFORM_REFRESH_TOKEN_COOKIE}=refresh-token`);

    const response = await proxy(request);

    expectPlatformLoginRedirect(response);
  });

  it("redirects authenticated users away from the login page", async () => {
    const request = new NextRequest("https://app.example.test/auth/platform/login?next=%2Fplatform%2Fa", {
      headers: {
        cookie: `${PLATFORM_ACCESS_TOKEN_COOKIE}=access-token`,
      },
    });

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://app.example.test/platform/a");
  });

  it("sanitizes absolute next urls on login redirects", async () => {
    const request = new NextRequest("https://app.example.test/auth/platform/login?next=https://evil.com/a", {
      headers: {
        cookie: `${PLATFORM_ACCESS_TOKEN_COOKIE}=access-token`,
      },
    });

    const response = await proxy(request);

    expect(response.headers.get("location")).toBe("https://app.example.test/a");
  });
});
