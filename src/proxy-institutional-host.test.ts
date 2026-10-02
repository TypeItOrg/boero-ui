import { NextRequest } from "next/server";
import { waitFor } from "@testing-library/react";
import { proxy } from "@/proxy";
import {
  INSTITUTIONAL_ACCESS_TOKEN_COOKIE,
  INSTITUTIONAL_REFRESH_TOKEN_COOKIE,
} from "@features/institutional-auth/utils/institutional-auth-cookies.util";

const A = { id: "22222222-2222-4222-8222-222222222222", name: "Conservatorio Boero", publicSubdomain: "cboero", logoUrl: null };
const B = { id: "33333333-3333-4333-8333-333333333333", name: "Otra institución", publicSubdomain: "otra", logoUrl: null };
const fetchMock = jest.fn();
const original = { api: process.env.BOERO_API_URL, public: process.env.FRONTEND_PUBLIC_URL, domain: process.env.INSTITUTIONAL_BASE_DOMAIN };
function request(host: string, path = "/auth/login", cookies = "", extra: Record<string, string> = {}): NextRequest {
  return new NextRequest(`https://${host}${path}`, { headers: { host, cookie: cookies, ...extra } });
}
beforeEach(() => {
  process.env.BOERO_API_URL = "http://backend.test";
  process.env.FRONTEND_PUBLIC_URL = "https://testing.typeit.com.ar";
  process.env.INSTITUTIONAL_BASE_DOMAIN = "testing.typeit.com.ar";
  global.fetch = fetchMock;
  fetchMock.mockReset();
});
afterAll(() => {
  process.env.BOERO_API_URL = original.api;
  process.env.FRONTEND_PUBLIC_URL = original.public;
  process.env.INSTITUTIONAL_BASE_DOMAIN = original.domain;
});
it("[A03.untrusted-header] strips forged internal tenant headers on generic requests", async () => {
  const response = await proxy(
    request("testing.typeit.com.ar", "/auth/login", "", {
      "X-Institutional-Host": "cboero.testing.typeit.com.ar",
      "X-Forwarded-Host": "cboero.testing.typeit.com.ar",
    }),
  );
  expect(response.status).toBe(200);
  expect(response.headers.get("x-middleware-request-x-institutional-host")).toBe("testing.typeit.com.ar");
  expect(fetchMock).not.toHaveBeenCalled();
});
it("[A03.untrusted-header] rebuilds branded context from actual configured Host", async () => {
  fetchMock.mockResolvedValue(new Response(JSON.stringify(A)));
  const response = await proxy(request("cboero.testing.typeit.com.ar", "/auth/login", "", { "X-Institutional-Host": "otra.testing.typeit.com.ar" }));
  expect(response.status).toBe(200);
  expect(response.headers.get("x-middleware-request-x-institutional-host")).toBe("cboero.testing.typeit.com.ar");
});
it.each([404, 503])("[I02.unknown-inactive] branded lookup failure %s does not fall back to selector", async (status) => {
  fetchMock.mockResolvedValue(new Response(null, { status }));
  const response = await proxy(request("cboero.testing.typeit.com.ar"));
  expect(response.status).toBe(status);
  expect(response.headers.get("x-middleware-rewrite")).toContain("/institutional-unavailable");
  expect(response.headers.get("x-middleware-rewrite")).toContain(`status=${status}`);
  expect(response.headers.get("cache-control")).toBe("no-store");
});
it("[I02.unavailable] transport outage returns 503", async () => {
  fetchMock.mockRejectedValue(new Error("offline"));
  const response = await proxy(request("cboero.testing.typeit.com.ar"));
  expect(response.status).toBe(503);
  expect(response.headers.get("x-middleware-rewrite")).toContain("/institutional-unavailable");
  expect(response.headers.get("x-middleware-rewrite")).toContain("status=503");
  expect(response.headers.get("cache-control")).toBe("no-store");
});
it("[A02.no-logo] health probe on branded host does not require tenant resolution", async () => {
  const response = await proxy(request("cboero.testing.typeit.com.ar", "/api/health", "", { "X-Institutional-Host": "otra.testing.typeit.com.ar" }));
  expect(response.status).toBe(200);
  expect(response.headers.get("x-middleware-request-x-institutional-host")).toBeNull();
  expect(fetchMock).not.toHaveBeenCalled();
});
it("[A05.refresh-regression] shared endpoint/token refresh is revalidated separately per host before cookies propagate", async () => {
  let completeRefresh: (response: Response) => void = () => {};
  fetchMock.mockImplementation(async (url: URL, init: RequestInit) => {
    const path = url.pathname;
    if (path.endsWith("/by-subdomain/cboero")) {
      return new Response(JSON.stringify(A));
    }
    if (path.endsWith("/by-subdomain/otra")) {
      return new Response(JSON.stringify(B));
    }
    if (path.endsWith("/refresh")) {
      return new Promise<Response>((resolve) => {
        completeRefresh = resolve;
      });
    }
    const host = new Headers(init.headers).get("X-Institutional-Host");
    return new Response(null, { status: host === "cboero.testing.typeit.com.ar" ? 200 : 403 });
  });
  const cookie = `${INSTITUTIONAL_REFRESH_TOKEN_COOKIE}=opaque-rotating-refresh`;
  // Wrong-host caller starts first; it cannot poison the valid caller's shared refresh.
  const wrong = proxy(request("otra.testing.typeit.com.ar", "/api/institutional/search", cookie));
  const right = proxy(request("cboero.testing.typeit.com.ar", "/api/institutional/search", cookie));
  await waitFor(() => expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith("/refresh"))).toHaveLength(1));
  completeRefresh(new Response(JSON.stringify({ tokens: { accessToken: "new-access", refreshToken: "new-refresh" } })));
  const [wrongResponse, rightResponse] = await Promise.all([wrong, right]);
  const refreshInit = fetchMock.mock.calls.find(([url]) => String(url).endsWith("/refresh"))[1];
  expect(new Headers(refreshInit.headers).has("X-Institutional-Host")).toBe(false);
  expect(wrongResponse.status).toBe(403);
  expect(wrongResponse.cookies.get(INSTITUTIONAL_ACCESS_TOKEN_COOKIE)).toBeUndefined();
  expect(wrongResponse.cookies.get(INSTITUTIONAL_REFRESH_TOKEN_COOKIE)).toBeUndefined();
  expect(wrongResponse.headers.get("x-middleware-request-cookie")).toBeNull();
  expect(rightResponse.cookies.get(INSTITUTIONAL_ACCESS_TOKEN_COOKIE)?.value).toBe("new-access");
  expect(rightResponse.cookies.get(INSTITUTIONAL_REFRESH_TOKEN_COOKIE)?.value).toBe("new-refresh");
  expect(rightResponse.headers.get("x-middleware-request-cookie")).toContain("new-refresh");
});
it.each([401, 403, 503])("[A05.refresh-regression] preserves cookies when post-refresh host validation returns %s", async (status) => {
  fetchMock.mockImplementation(async (url: URL) => {
    if (url.pathname.includes("/by-subdomain/")) {
      return new Response(JSON.stringify(A));
    }
    if (url.pathname.endsWith("/refresh")) {
      return new Response(JSON.stringify({ tokens: { accessToken: "new-access", refreshToken: "new-refresh" } }));
    }
    return new Response(null, { status });
  });
  const response = await proxy(
    request("cboero.testing.typeit.com.ar", "/api/institutional/search", `${INSTITUTIONAL_REFRESH_TOKEN_COOKIE}=refresh-${status}`),
  );
  expect(response.status).toBe(status === 403 ? 403 : 503);
  expect(response.cookies.get(INSTITUTIONAL_REFRESH_TOKEN_COOKIE)).toBeUndefined();
});
