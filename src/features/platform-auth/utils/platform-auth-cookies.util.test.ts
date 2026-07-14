jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

import { cookies } from "next/headers";
import {
  clearPlatformAuthCookies,
  getPlatformAuthCookieOptions,
  PLATFORM_ACCESS_TOKEN_COOKIE,
  PLATFORM_ACCESS_TOKEN_MAX_AGE,
  PLATFORM_REFRESH_TOKEN_COOKIE,
  PLATFORM_REFRESH_TOKEN_MAX_AGE,
  setPlatformAuthCookies,
} from "@features/platform-auth/utils/platform-auth-cookies.util";

describe("platform-auth-cookies.util", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalAuthCookieSecure = process.env.AUTH_COOKIE_SECURE;
  const cookiesMock = jest.mocked(cookies);
  const rawCookieStore = {
    [Symbol.iterator]: function* iterator() {},
    delete: jest.fn(),
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    set: jest.fn(),
    size: 0,
  };
  const cookieStore = rawCookieStore as unknown as Awaited<ReturnType<typeof cookies>>;

  beforeEach(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
    delete process.env.AUTH_COOKIE_SECURE;
    cookiesMock.mockResolvedValue(cookieStore);
  });

  afterEach(() => {
    rawCookieStore.set.mockReset();
    rawCookieStore.delete.mockReset();
    cookiesMock.mockReset();
  });

  afterAll(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv;

    if (originalAuthCookieSecure === undefined) {
      delete process.env.AUTH_COOKIE_SECURE;
    } else {
      process.env.AUTH_COOKIE_SECURE = originalAuthCookieSecure;
    }
  });

  it("returns insecure cookie options outside production", () => {
    expect(getPlatformAuthCookieOptions(123)).toEqual({
      httpOnly: true,
      maxAge: 123,
      path: "/",
      sameSite: "lax",
      secure: false,
    });
  });

  it("returns secure cookie options in production", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";

    expect(getPlatformAuthCookieOptions(456)).toEqual({
      httpOnly: true,
      maxAge: 456,
      path: "/",
      sameSite: "lax",
      secure: true,
    });
  });

  it("allows insecure cookies for an HTTP production deployment", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    process.env.AUTH_COOKIE_SECURE = "false";

    expect(getPlatformAuthCookieOptions(456)).toEqual({
      httpOnly: true,
      maxAge: 456,
      path: "/",
      sameSite: "lax",
      secure: false,
    });
  });

  it("sets both platform auth cookies", async () => {
    await setPlatformAuthCookies({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });

    expect(cookieStore.set).toHaveBeenCalledWith(
      PLATFORM_ACCESS_TOKEN_COOKIE,
      "access-token",
      getPlatformAuthCookieOptions(PLATFORM_ACCESS_TOKEN_MAX_AGE),
    );
    expect(cookieStore.set).toHaveBeenCalledWith(
      PLATFORM_REFRESH_TOKEN_COOKIE,
      "refresh-token",
      getPlatformAuthCookieOptions(PLATFORM_REFRESH_TOKEN_MAX_AGE),
    );
  });

  it("clears both platform auth cookies", async () => {
    await clearPlatformAuthCookies();

    expect(cookieStore.delete).toHaveBeenCalledWith(PLATFORM_ACCESS_TOKEN_COOKIE);
    expect(cookieStore.delete).toHaveBeenCalledWith(PLATFORM_REFRESH_TOKEN_COOKIE);
  });
});
