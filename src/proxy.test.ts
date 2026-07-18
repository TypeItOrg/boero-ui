import { NextRequest, type NextResponse } from "next/server";

import {
  PLATFORM_ACCESS_TOKEN_COOKIE,
  PLATFORM_REFRESH_TOKEN_COOKIE,
} from "@features/platform-auth/utils/platform-auth-cookies.util";
import {
  INSTITUTIONAL_ACCESS_TOKEN_COOKIE,
  INSTITUTIONAL_REFRESH_TOKEN_COOKIE,
} from "@features/institutional-auth/utils/institutional-auth-cookies.util";
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
      "https://app.example.test/admin/auth/login?next=%2Fadmin%2Forders%3Fpage%3D2",
    );
    expect(response.cookies.get(PLATFORM_ACCESS_TOKEN_COOKIE)?.value).toBeUndefined();
    expect(response.cookies.get(PLATFORM_REFRESH_TOKEN_COOKIE)?.value).toBeUndefined();
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

  it("allows admin routes when an access token cookie is present", async () => {
    const request = createRequest("/admin", `${PLATFORM_ACCESS_TOKEN_COOKIE}=access-token`);

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

    const request = createRequest("/admin/orders?page=2", `${PLATFORM_REFRESH_TOKEN_COOKIE}=refresh-token`);

    const response = await proxy(request);

    expect(fetchMock).toHaveBeenCalledWith(new URL("/api/v1/admin/auth/refresh", "https://api.example.test"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: "refresh-token" }),
    });
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.cookies.get(PLATFORM_ACCESS_TOKEN_COOKIE)?.value).toBe("new-access-token");
    expect(response.cookies.get(PLATFORM_REFRESH_TOKEN_COOKIE)?.value).toBe("new-refresh-token");

    const upstreamCookies = response.headers.get("x-middleware-request-cookie");

    expect(upstreamCookies).toContain(PLATFORM_ACCESS_TOKEN_COOKIE + "=new-access-token");
    expect(upstreamCookies).toContain(PLATFORM_REFRESH_TOKEN_COOKIE + "=new-refresh-token");
  });

  it("shares one refresh request between concurrent admin proxy calls", async () => {
    let resolveRefresh: ((response: Response) => void) | undefined;
    fetchMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRefresh = resolve;
        }),
    );

    const firstRequest = createRequest("/admin/institutions/1", `${PLATFORM_REFRESH_TOKEN_COOKIE}=refresh-token`);
    const secondRequest = createRequest("/admin/institutions/2", `${PLATFORM_REFRESH_TOKEN_COOKIE}=refresh-token`);
    const firstResponsePromise = proxy(firstRequest);
    const secondResponsePromise = proxy(secondRequest);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolveRefresh?.(
      new Response(
        JSON.stringify({
          tokens: {
            accessToken: "new-access-token",
            refreshToken: "new-refresh-token",
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    const [firstResponse, secondResponse] = await Promise.all([firstResponsePromise, secondResponsePromise]);

    expect(firstResponse.cookies.get(PLATFORM_ACCESS_TOKEN_COOKIE)?.value).toBe("new-access-token");
    expect(secondResponse.cookies.get(PLATFORM_REFRESH_TOKEN_COOKIE)?.value).toBe("new-refresh-token");
  });

  it("redirects to login when refresh returns no usable tokens", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ tokens: {} }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const request = createRequest("/admin/orders?page=2", `${PLATFORM_REFRESH_TOKEN_COOKIE}=refresh-token`);

    const response = await proxy(request);

    expectPlatformLoginRedirect(response);
  });

  it("clears auth cookies when the backend definitively rejects the refresh token", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: "Refresh token invalido" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      }),
    );

    const request = createRequest("/admin/orders?page=2", `${PLATFORM_REFRESH_TOKEN_COOKIE}=refresh-token`);

    const response = await proxy(request);

    expect(response.cookies.get(PLATFORM_ACCESS_TOKEN_COOKIE)?.value).toBe("");
    expect(response.cookies.get(PLATFORM_REFRESH_TOKEN_COOKIE)?.value).toBe("");
  });

  it("redirects to login when refresh throws", async () => {
    fetchMock.mockRejectedValue(new Error("network"));

    const request = createRequest("/admin/orders?page=2", `${PLATFORM_REFRESH_TOKEN_COOKIE}=refresh-token`);

    const response = await proxy(request);

    expectPlatformLoginRedirect(response);
    expect(response.cookies.get(PLATFORM_REFRESH_TOKEN_COOKIE)).toBeUndefined();
  });

  it("redirects authenticated users away from the login page", async () => {
    const request = new NextRequest("https://app.example.test/admin/auth/login?next=%2Fadmin%2Fa", {
      headers: {
        cookie: `${PLATFORM_ACCESS_TOKEN_COOKIE}=access-token`,
      },
    });

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://app.example.test/admin/a");
  });

  it("allows unauthenticated users to access the login page", async () => {
    const request = createRequest("/admin/auth/login", "");

    const response = await proxy(request);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("does not apply admin authentication to public routes", async () => {
    const request = createRequest("/auth/login", "");

    const response = await proxy(request);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("protects the institutional home with the institutional session", async () => {
    const request = createRequest("/", "");

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://app.example.test/auth/login");
  });

  it("allows the institutional home with an institutional access token", async () => {
    const request = createRequest("/", `${INSTITUTIONAL_ACCESS_TOKEN_COOKIE}=access-token`);

    const response = await proxy(request);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("refreshes an institutional session", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ tokens: { accessToken: "new-access", refreshToken: "new-refresh" } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const request = createRequest("/", `${INSTITUTIONAL_REFRESH_TOKEN_COOKIE}=refresh-token`);
    const response = await proxy(request);

    expect(fetchMock).toHaveBeenCalledWith(new URL("/api/v1/auth/refresh", "https://api.example.test"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: "refresh-token" }),
    });
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.cookies.get(INSTITUTIONAL_ACCESS_TOKEN_COOKIE)?.value).toBe("new-access");
    expect(response.cookies.get(INSTITUTIONAL_REFRESH_TOKEN_COOKIE)?.value).toBe("new-refresh");
  });

  it("redirects an authenticated institutional user away from login", async () => {
    const request = createRequest("/auth/login", `${INSTITUTIONAL_ACCESS_TOKEN_COOKIE}=access-token`);

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://app.example.test/");
  });

  it("sanitizes absolute next urls on login redirects", async () => {
    const request = new NextRequest("https://app.example.test/admin/auth/login?next=https://evil.com/a", {
      headers: {
        cookie: `${PLATFORM_ACCESS_TOKEN_COOKIE}=access-token`,
      },
    });

    const response = await proxy(request);

    expect(response.headers.get("location")).toBe("https://app.example.test/a");
  });
});
