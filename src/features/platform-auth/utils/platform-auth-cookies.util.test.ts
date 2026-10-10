import { cookies } from "next/headers";

import { clearPlatformAuthCookies, setPlatformAuthCookies } from "@features/platform-auth/utils/platform-auth-cookies.util";

jest.mock("next/headers", () => ({ cookies: jest.fn() }));

describe("platform authentication cookie contract", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalSecure = process.env.AUTH_COOKIE_SECURE;
  const cookieStore = { delete: jest.fn(), set: jest.fn() };

  beforeEach(() => {
    jest.mocked(cookies).mockResolvedValue(cookieStore as never);
  });
  afterEach(() => {
    jest.mocked(cookies).mockReset();
    cookieStore.set.mockReset();
    cookieStore.delete.mockReset();
    (process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv;

    if (originalSecure === undefined) {
      delete process.env.AUTH_COOKIE_SECURE;
    } else {
      process.env.AUTH_COOKIE_SECURE = originalSecure;
    }
  });

  it.each([
    { environment: "test", override: undefined, secure: false },
    { environment: "production", override: undefined, secure: true },
    { environment: "production", override: "false", secure: false },
    { environment: "test", override: "true", secure: true },
  ])("writes protected cookies in $environment with override=$override", async ({ environment, override, secure }) => {
    (process.env as Record<string, string | undefined>).NODE_ENV = environment;

    if (override === undefined) {
      delete process.env.AUTH_COOKIE_SECURE;
    } else {
      process.env.AUTH_COOKIE_SECURE = override;
    }

    await setPlatformAuthCookies({ accessToken: "access-token", refreshToken: "refresh-token" });

    expect(cookieStore.set).toHaveBeenCalledTimes(2);
    expect(cookieStore.set).toHaveBeenCalledWith("platform_access_token", "access-token", {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure,
      maxAge: 900,
    });
    expect(cookieStore.set).toHaveBeenCalledWith("platform_refresh_token", "refresh-token", {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure,
      maxAge: 2592000,
    });
  });

  it("removes both platform credentials on logout", async () => {
    await clearPlatformAuthCookies();
    expect(cookieStore.delete).toHaveBeenCalledTimes(2);
    expect(cookieStore.delete).toHaveBeenCalledWith("platform_access_token");
    expect(cookieStore.delete).toHaveBeenCalledWith("platform_refresh_token");
  });
});
