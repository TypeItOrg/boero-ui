import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { NextRequest, type NextResponse } from "next/server";

import type { PlatformAccount } from "@features/platform-auth/types/platform-account.types";

const API_URL = "https://api.example.test";
const PLATFORM_ACCESS_TOKEN_COOKIE = "platform_access_token";
const PLATFORM_REFRESH_TOKEN_COOKIE = "platform_refresh_token";
const AUTH_COOKIE_NAMES = [PLATFORM_ACCESS_TOKEN_COOKIE, PLATFORM_REFRESH_TOKEN_COOKIE] as const;
const LOGIN_CREDENTIALS = {
  email: "admin@example.com",
  password: "secret",
};

type CookieJarStore = {
  [Symbol.iterator]: () => Generator<never, void, unknown>;
  delete: jest.Mock;
  get: jest.Mock;
  getAll: jest.Mock;
  has: jest.Mock;
  set: jest.Mock;
  size: number;
};

class RedirectError extends Error {
  constructor(readonly url: string) {
    super("NEXT_REDIRECT");
  }
}

class PlatformCookieJar {
  private readonly cookies = new Map<string, string>();

  asCookieStore(): CookieJarStore {
    const cookies = this.cookies;

    return {
      [Symbol.iterator]: function* iterator() {},
      delete: jest.fn((name: string) => {
        cookies.delete(name);
      }),
      get: jest.fn((name: string) => getCookieValue(cookies, name)),
      getAll: jest.fn(() => Array.from(cookies, ([name, value]) => ({ name, value }))),
      has: jest.fn((name: string) => cookies.has(name)),
      set: jest.fn((name: string, value: string) => {
        cookies.set(name, value);
      }),
      size: cookies.size,
    };
  }

  set(name: string, value: string): void {
    this.cookies.set(name, value);
  }

  get(name: string): string | undefined {
    return this.cookies.get(name);
  }

  has(name: string): boolean {
    return this.cookies.has(name);
  }

  toRequestCookieHeader(): string {
    return Array.from(this.cookies, ([name, value]) => `${name}=${value}`).join("; ");
  }

  applyResponseCookies(response: NextResponse): void {
    for (const name of AUTH_COOKIE_NAMES) {
      const cookie = response.cookies.get(name);

      if (!cookie) continue;
      if (cookie.value === "") {
        this.cookies.delete(name);
        continue;
      }

      this.cookies.set(name, cookie.value);
    }
  }
}

function getCookieValue(cookies: Map<string, string>, name: string): { value: string } | undefined {
  const value = cookies.get(name);
  return value ? { value } : undefined;
}

const account: PlatformAccount = {
  platformAccountId: "platform-account-1",
  email: "admin@example.com",
  name: "Ada",
  lastName: "Lovelace",
};

const loginTokens = {
  accessToken: "login-access-token",
  refreshToken: "login-refresh-token",
};

const refreshedTokens = {
  accessToken: "refreshed-access-token",
  refreshToken: "refreshed-refresh-token",
};

let cookieJar: PlatformCookieJar;
let redirectMock: jest.Mock;
let lastAccountAuthorization: string | null = null;

const server = setupServer(
  http.post(`${API_URL}/api/v1/admin/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };

    if (body.email !== LOGIN_CREDENTIALS.email || body.password !== LOGIN_CREDENTIALS.password) {
      return HttpResponse.json({ status: 401, message: "Credenciales invalidas" }, { status: 401 });
    }

    return HttpResponse.json({
      account,
      tokens: loginTokens,
    });
  }),
  http.post(`${API_URL}/api/v1/admin/auth/refresh`, async ({ request }) => {
    const body = (await request.json()) as { refreshToken?: string };

    if (body.refreshToken !== loginTokens.refreshToken) {
      return HttpResponse.json({ status: 401, message: "Refresh token invalido" }, { status: 401 });
    }

    return HttpResponse.json({
      tokens: refreshedTokens,
    });
  }),
  http.get(`${API_URL}/api/v1/admin/auth/me`, ({ request }) => {
    lastAccountAuthorization = request.headers.get("authorization");

    if (
      lastAccountAuthorization !== `Bearer ${loginTokens.accessToken}` &&
      lastAccountAuthorization !== `Bearer ${refreshedTokens.accessToken}`
    ) {
      return HttpResponse.json({ status: 401, message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json({ account });
  }),
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
  jest.resetModules();
});

afterAll(() => {
  server.close();
});

beforeEach(() => {
  process.env.BOERO_API_URL = API_URL;
  cookieJar = new PlatformCookieJar();
  lastAccountAuthorization = null;
  redirectMock = jest.fn((url: string) => {
    throw new RedirectError(url);
  });

  jest.doMock("next/headers", () => ({
    cookies: jest.fn(async () => cookieJar.asCookieStore()),
  }));

  jest.doMock("next/navigation", () => ({
    redirect: redirectMock,
  }));
});

async function login(next = "/admin"): Promise<void> {
  const { loginPlatform } = await import("@features/platform-auth/actions/platform-login.action");

  await expect(loginPlatform({}, createLoginFormData(next))).rejects.toMatchObject({
    url: next,
  });
}

function createLoginFormData(next: string): FormData {
  const formData = new FormData();

  formData.set("email", LOGIN_CREDENTIALS.email);
  formData.set("password", LOGIN_CREDENTIALS.password);
  formData.set("next", next);

  return formData;
}

function createPlatformRequest(path = "/admin"): NextRequest {
  return new NextRequest(`https://app.example.test${path}`, {
    headers: {
      cookie: cookieJar.toRequestCookieHeader(),
    },
  });
}

describe("platform auth integration", () => {
  it("logs in through the real action, stores auth cookies, and redirects", async () => {
    await login("/admin");

    expect(cookieJar.get(PLATFORM_ACCESS_TOKEN_COOKIE)).toBe(loginTokens.accessToken);
    expect(cookieJar.get(PLATFORM_REFRESH_TOKEN_COOKIE)).toBe(loginTokens.refreshToken);
    expect(redirectMock).toHaveBeenCalledWith("/admin");
  });

  it("loads the platform account using the access token stored by login", async () => {
    await login("/admin");

    const { getPlatformAccount } = await import("@features/platform-auth/services/get-platform-account.service");

    await expect(getPlatformAccount()).resolves.toEqual(account);
    expect(lastAccountAuthorization).toBe(`Bearer ${loginTokens.accessToken}`);
  });

  it("refreshes missing access tokens in proxy and uses the refreshed token for account loading", async () => {
    cookieJar.set(PLATFORM_REFRESH_TOKEN_COOKIE, loginTokens.refreshToken);

    const { proxy } = await import("../../src/proxy");
    const response = await proxy(createPlatformRequest());

    cookieJar.applyResponseCookies(response);

    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(cookieJar.get(PLATFORM_ACCESS_TOKEN_COOKIE)).toBe(refreshedTokens.accessToken);
    expect(cookieJar.get(PLATFORM_REFRESH_TOKEN_COOKIE)).toBe(refreshedTokens.refreshToken);

    const { getPlatformAccount } = await import("@features/platform-auth/services/get-platform-account.service");

    await expect(getPlatformAccount()).resolves.toEqual(account);
    expect(lastAccountAuthorization).toBe(`Bearer ${refreshedTokens.accessToken}`);
  });

  it("redirects to login and clears auth cookies when refresh fails", async () => {
    cookieJar.set(PLATFORM_REFRESH_TOKEN_COOKIE, "invalid-refresh-token");

    const { proxy } = await import("../../src/proxy");
    const response = await proxy(createPlatformRequest());

    cookieJar.applyResponseCookies(response);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://app.example.test/admin/auth/login?next=%2Fadmin");
    expect(cookieJar.has(PLATFORM_ACCESS_TOKEN_COOKIE)).toBe(false);
    expect(cookieJar.has(PLATFORM_REFRESH_TOKEN_COOKIE)).toBe(false);
  });
});
