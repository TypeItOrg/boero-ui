import { NextRequest, type NextResponse } from "next/server";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";

import { PLATFORM_ACCESS_TOKEN_COOKIE, PLATFORM_REFRESH_TOKEN_COOKIE } from "@features/platform-auth/utils/platform-auth-cookies.util";
import {
  INSTITUTIONAL_ACCESS_TOKEN_COOKIE,
  INSTITUTIONAL_REFRESH_TOKEN_COOKIE,
} from "@features/institutional-auth/utils/institutional-auth-cookies.util";
import { config, proxy } from "@/proxy";

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
    expect(response.headers.get("location")).toBe("https://app.example.test/admin/auth/login?next=%2Fadmin%2Forders%3Fpage%3D2");
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

  it.each([
    "/api/admin/search",
    "/api/admin/academic/options/training-paths",
    "/api/institutional/search",
    "/api/institutional/academic/options/training-paths",
  ])("runs for the authenticated BFF route %s", (pathname) => {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: pathname })).toBe(true);
  });

  it.each(["/api/health", "/api/countries"])("does not run for the public API route %s", (pathname) => {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: pathname })).toBe(false);
  });

  it("allows admin routes when an access token cookie is present", async () => {
    const request = createRequest("/admin", `${PLATFORM_ACCESS_TOKEN_COOKIE}=access-token`);

    const response = await proxy(request);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("refreshes an admin BFF request when the refresh token is valid", async () => {
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

    const request = createRequest("/api/admin/search?search=pa", `${PLATFORM_REFRESH_TOKEN_COOKIE}=refresh-token`);

    const response = await proxy(request);

    expect(fetchMock).toHaveBeenCalledWith(
      new URL("/api/v1/admin/auth/refresh", "https://api.example.test"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: "refresh-token" }),
        signal: expect.any(AbortSignal),
      }),
    );
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.cookies.get(PLATFORM_ACCESS_TOKEN_COOKIE)?.value).toBe("new-access-token");
    expect(response.cookies.get(PLATFORM_REFRESH_TOKEN_COOKIE)?.value).toBe("new-refresh-token");

    const upstreamCookies = response.headers.get("x-middleware-request-cookie");

    expect(upstreamCookies).toContain(PLATFORM_ACCESS_TOKEN_COOKIE + "=new-access-token");
    expect(upstreamCookies).toContain(PLATFORM_REFRESH_TOKEN_COOKIE + "=new-refresh-token");
  });

  it("deduplicates concurrent admin refreshes for the same token", async () => {
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
    expect(firstResponse.cookies.get(PLATFORM_REFRESH_TOKEN_COOKIE)?.value).toBe("new-refresh-token");
    expect(secondResponse.cookies.get(PLATFORM_ACCESS_TOKEN_COOKIE)?.value).toBe("new-access-token");
    expect(secondResponse.cookies.get(PLATFORM_REFRESH_TOKEN_COOKIE)?.value).toBe("new-refresh-token");
    expect(firstResponse.headers.get("x-middleware-request-cookie")).toContain(PLATFORM_REFRESH_TOKEN_COOKIE + "=new-refresh-token");
    expect(secondResponse.headers.get("x-middleware-request-cookie")).toContain(PLATFORM_REFRESH_TOKEN_COOKIE + "=new-refresh-token");
  });

  it("refreshes different admin tokens independently", async () => {
    fetchMock.mockImplementation(
      async () =>
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

    const firstRequest = createRequest("/admin/institutions/1", `${PLATFORM_REFRESH_TOKEN_COOKIE}=refresh-token-1`);
    const secondRequest = createRequest("/admin/institutions/2", `${PLATFORM_REFRESH_TOKEN_COOKIE}=refresh-token-2`);

    const [firstResponse, secondResponse] = await Promise.all([proxy(firstRequest), proxy(secondRequest)]);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(firstResponse.cookies.get(PLATFORM_ACCESS_TOKEN_COOKIE)?.value).toBe("new-access-token");
    expect(secondResponse.cookies.get(PLATFORM_ACCESS_TOKEN_COOKIE)?.value).toBe("new-access-token");
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
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    const request = new NextRequest("https://app.example.test/admin/auth/login?next=%2Fadmin%2Fa", {
      headers: {
        cookie: `${PLATFORM_ACCESS_TOKEN_COOKIE}=access-token`,
      },
    });

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://app.example.test/admin/a");
  });

  it("bounds guest session checks with an abort signal", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 503 }));
    const request = new NextRequest("https://app.example.test/admin/auth/login", {
      headers: { cookie: `${PLATFORM_ACCESS_TOKEN_COOKIE}=access-token` },
    });

    await proxy(request);

    expect(fetchMock).toHaveBeenCalledWith(
      new URL("/api/v1/admin/auth/me", "https://api.example.test"),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
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

  it.each(["/account", "/people", "/people/person-1", "/roles", "/future-portal-route"])(
    "protects the institutional route %s with the institutional session",
    async (pathname) => {
      const request = createRequest(pathname, "");

      const response = await proxy(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("https://app.example.test/auth/login");
    },
  );

  it("allows the institutional home with an institutional access token", async () => {
    const request = createRequest("/", `${INSTITUTIONAL_ACCESS_TOKEN_COOKIE}=access-token`);

    const response = await proxy(request);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("refreshes an institutional BFF request", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ tokens: { accessToken: "new-access", refreshToken: "new-refresh" } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const request = createRequest(
      "/api/institutional/search?search=pa&institutionId=019e18e4-d919-76d8-9848-7f1b14e64452",
      `${INSTITUTIONAL_REFRESH_TOKEN_COOKIE}=refresh-token`,
    );
    const response = await proxy(request);

    expect(fetchMock).toHaveBeenCalledWith(
      new URL("/api/v1/auth/refresh", "https://api.example.test"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: "refresh-token" }),
        signal: expect.any(AbortSignal),
      }),
    );
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.cookies.get(INSTITUTIONAL_ACCESS_TOKEN_COOKIE)?.value).toBe("new-access");
    expect(response.cookies.get(INSTITUTIONAL_REFRESH_TOKEN_COOKIE)?.value).toBe("new-refresh");
    expect(response.headers.get("x-middleware-request-cookie")).toContain(INSTITUTIONAL_ACCESS_TOKEN_COOKIE + "=new-access");
    expect(response.headers.get("x-middleware-request-cookie")).toContain(INSTITUTIONAL_REFRESH_TOKEN_COOKIE + "=new-refresh");
  });

  it("deduplicates concurrent institutional refreshes for the same token", async () => {
    let resolveRefresh: ((response: Response) => void) | undefined;
    fetchMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRefresh = resolve;
        }),
    );

    const firstRequest = createRequest("/people", `${INSTITUTIONAL_REFRESH_TOKEN_COOKIE}=refresh-token`);
    const secondRequest = createRequest("/roles", `${INSTITUTIONAL_REFRESH_TOKEN_COOKIE}=refresh-token`);
    const firstResponsePromise = proxy(firstRequest);
    const secondResponsePromise = proxy(secondRequest);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolveRefresh?.(
      new Response(JSON.stringify({ tokens: { accessToken: "new-access", refreshToken: "new-refresh" } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const [firstResponse, secondResponse] = await Promise.all([firstResponsePromise, secondResponsePromise]);

    expect(firstResponse.cookies.get(INSTITUTIONAL_ACCESS_TOKEN_COOKIE)?.value).toBe("new-access");
    expect(firstResponse.cookies.get(INSTITUTIONAL_REFRESH_TOKEN_COOKIE)?.value).toBe("new-refresh");
    expect(secondResponse.cookies.get(INSTITUTIONAL_ACCESS_TOKEN_COOKIE)?.value).toBe("new-access");
    expect(secondResponse.cookies.get(INSTITUTIONAL_REFRESH_TOKEN_COOKIE)?.value).toBe("new-refresh");
    expect(firstResponse.headers.get("x-middleware-request-cookie")).toContain(INSTITUTIONAL_REFRESH_TOKEN_COOKIE + "=new-refresh");
    expect(secondResponse.headers.get("x-middleware-request-cookie")).toContain(INSTITUTIONAL_REFRESH_TOKEN_COOKIE + "=new-refresh");
  });

  it.each(["/auth/register", "/auth/password-recovery", "/auth/password-recovery/reset"])(
    "keeps the institutional public route %s accessible",
    async (pathname) => {
      const response = await proxy(createRequest(pathname, ""));

      expect(fetchMock).not.toHaveBeenCalled();
      expect(response.headers.get("x-middleware-next")).toBe("1");
    },
  );

  it("redirects an authenticated institutional user away from login", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    const request = createRequest("/auth/login", `${INSTITUTIONAL_ACCESS_TOKEN_COOKIE}=access-token`);

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://app.example.test/");
  });

  it("allows institutional login and clears cookies when the existing session was revoked", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));
    const request = createRequest(
      "/auth/login",
      `${INSTITUTIONAL_ACCESS_TOKEN_COOKIE}=revoked-access; ${INSTITUTIONAL_REFRESH_TOKEN_COOKIE}=revoked-refresh`,
    );

    const response = await proxy(request);

    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.cookies.get(INSTITUTIONAL_ACCESS_TOKEN_COOKIE)?.value).toBe("");
    expect(response.cookies.get(INSTITUTIONAL_REFRESH_TOKEN_COOKIE)?.value).toBe("");
  });

  it("refreshes and redirects to home when guest route has expired access token and valid refresh token", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 })).mockResolvedValueOnce(
      new Response(JSON.stringify({ tokens: { accessToken: "new-access", refreshToken: "new-refresh" } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const request = createRequest(
      "/auth/login",
      `${INSTITUTIONAL_ACCESS_TOKEN_COOKIE}=expired-access; ${INSTITUTIONAL_REFRESH_TOKEN_COOKIE}=valid-refresh`,
    );

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://app.example.test/");
    expect(response.cookies.get(INSTITUTIONAL_ACCESS_TOKEN_COOKIE)?.value).toBe("new-access");
    expect(response.cookies.get(INSTITUTIONAL_REFRESH_TOKEN_COOKIE)?.value).toBe("new-refresh");
  });

  it("sanitizes absolute next urls on login redirects", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    const request = new NextRequest("https://app.example.test/admin/auth/login?next=https://evil.com/a", {
      headers: {
        cookie: `${PLATFORM_ACCESS_TOKEN_COOKIE}=access-token`,
      },
    });

    const response = await proxy(request);

    expect(response.headers.get("location")).toBe("https://app.example.test/a");
  });
});
