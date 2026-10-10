import { cookies } from "next/headers";

import {
  clearInstitutionalAuthCookies,
  clearInstitutionalLoginFlashCookies,
  hasInstitutionalPasswordChangedCookie,
  setInstitutionalAuthCookies,
  setInstitutionalPasswordChangedCookie,
} from "@features/institutional-auth/utils/institutional-auth-cookies.util";

jest.mock("next/headers", () => ({ cookies: jest.fn() }));

describe("institutional authentication cookie contract", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalSecure = process.env.AUTH_COOKIE_SECURE;
  const cookieStore = { delete: jest.fn(), get: jest.fn(), set: jest.fn() };

  beforeEach(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    delete process.env.AUTH_COOKIE_SECURE;
    jest.mocked(cookies).mockResolvedValue(cookieStore as never);
  });
  afterEach(() => {
    cookieStore.delete.mockReset();
    cookieStore.get.mockReset();
    cookieStore.set.mockReset();
    (process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv;

    if (originalSecure === undefined) {
      delete process.env.AUTH_COOKIE_SECURE;
    } else {
      process.env.AUTH_COOKIE_SECURE = originalSecure;
    }
  });

  it.each([
    { rememberMe: false, refreshMaxAge: 604800 },
    { rememberMe: true, refreshMaxAge: 2592000 },
  ])("writes protected credentials with rememberMe=$rememberMe", async ({ rememberMe, refreshMaxAge }) => {
    await setInstitutionalAuthCookies({ accessToken: "access-token", refreshToken: "refresh-token" }, rememberMe);
    expect(cookieStore.set).toHaveBeenCalledTimes(2);
    expect(cookieStore.set).toHaveBeenCalledWith("institutional_access_token", "access-token", {
      httpOnly: true,
      maxAge: 900,
      path: "/",
      sameSite: "lax",
      secure: true,
    });
    expect(cookieStore.set).toHaveBeenCalledWith("institutional_refresh_token", "refresh-token", {
      httpOnly: true,
      maxAge: refreshMaxAge,
      path: "/",
      sameSite: "lax",
      secure: true,
    });
  });

  it("removes both institutional credentials on logout", async () => {
    await clearInstitutionalAuthCookies();
    expect(cookieStore.delete).toHaveBeenCalledTimes(2);
    expect(cookieStore.delete).toHaveBeenCalledWith("institutional_access_token");
    expect(cookieStore.delete).toHaveBeenCalledWith("institutional_refresh_token");
  });

  it("sets a short-lived password acknowledgement and clears both login acknowledgements", async () => {
    await expect(hasInstitutionalPasswordChangedCookie()).resolves.toBe(false);
    await setInstitutionalPasswordChangedCookie();
    expect(cookieStore.set).toHaveBeenCalledWith("institutional_password_changed", "true", {
      httpOnly: true,
      maxAge: 5,
      path: "/",
      sameSite: "lax",
      secure: true,
    });
    cookieStore.get.mockReturnValue({ value: "true" });
    await expect(hasInstitutionalPasswordChangedCookie()).resolves.toBe(true);
    expect(cookieStore.get).toHaveBeenCalledWith("institutional_password_changed");

    await clearInstitutionalLoginFlashCookies();
    expect(cookieStore.delete).toHaveBeenCalledTimes(2);
    expect(cookieStore.delete).toHaveBeenCalledWith("institutional_email_verified");
    expect(cookieStore.delete).toHaveBeenCalledWith("institutional_password_changed");
    cookieStore.get.mockReturnValue(undefined);
    await expect(hasInstitutionalPasswordChangedCookie()).resolves.toBe(false);
  });
});
