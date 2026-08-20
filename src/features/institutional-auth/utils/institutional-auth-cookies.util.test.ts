jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

import { cookies } from "next/headers";

import {
  clearInstitutionalAuthCookies,
  clearInstitutionalPasswordChangedCookie,
  hasInstitutionalPasswordChangedCookie,
  INSTITUTIONAL_ACCESS_TOKEN_COOKIE,
  INSTITUTIONAL_ACCESS_TOKEN_MAX_AGE,
  INSTITUTIONAL_REFRESH_TOKEN_COOKIE,
  INSTITUTIONAL_REFRESH_TOKEN_MAX_AGE,
  INSTITUTIONAL_REMEMBER_ME_MAX_AGE,
  INSTITUTIONAL_PASSWORD_CHANGED_COOKIE,
  INSTITUTIONAL_PASSWORD_CHANGED_MAX_AGE,
  setInstitutionalPasswordChangedCookie,
  setInstitutionalAuthCookies,
} from "@features/institutional-auth/utils/institutional-auth-cookies.util";

describe("institutional auth cookies", () => {
  const cookieStore = {
    delete: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(() => {
    jest.mocked(cookies).mockResolvedValue(cookieStore as never);
    cookieStore.delete.mockReset();
    cookieStore.get.mockReset();
    cookieStore.set.mockReset();
  });

  it("sets access and regular refresh cookies", async () => {
    await setInstitutionalAuthCookies({ accessToken: "access-token", refreshToken: "refresh-token" }, false);

    expect(cookieStore.set).toHaveBeenNthCalledWith(
      1,
      INSTITUTIONAL_ACCESS_TOKEN_COOKIE,
      "access-token",
      expect.objectContaining({ maxAge: INSTITUTIONAL_ACCESS_TOKEN_MAX_AGE }),
    );
    expect(cookieStore.set).toHaveBeenNthCalledWith(
      2,
      INSTITUTIONAL_REFRESH_TOKEN_COOKIE,
      "refresh-token",
      expect.objectContaining({ maxAge: INSTITUTIONAL_REFRESH_TOKEN_MAX_AGE }),
    );
  });

  it("uses the longer refresh duration for remember-me sessions", async () => {
    await setInstitutionalAuthCookies({ accessToken: "access-token", refreshToken: "refresh-token" }, true);

    expect(cookieStore.set).toHaveBeenLastCalledWith(
      INSTITUTIONAL_REFRESH_TOKEN_COOKIE,
      "refresh-token",
      expect.objectContaining({ maxAge: INSTITUTIONAL_REMEMBER_ME_MAX_AGE }),
    );
  });

  it("clears both institutional cookies", async () => {
    await clearInstitutionalAuthCookies();

    expect(cookieStore.delete).toHaveBeenNthCalledWith(1, INSTITUTIONAL_ACCESS_TOKEN_COOKIE);
    expect(cookieStore.delete).toHaveBeenNthCalledWith(2, INSTITUTIONAL_REFRESH_TOKEN_COOKIE);
  });

  it("sets and reads the password changed flash cookie", async () => {
    await setInstitutionalPasswordChangedCookie();

    expect(cookieStore.set).toHaveBeenCalledWith(
      INSTITUTIONAL_PASSWORD_CHANGED_COOKIE,
      "true",
      expect.objectContaining({ maxAge: INSTITUTIONAL_PASSWORD_CHANGED_MAX_AGE }),
    );

    cookieStore.get.mockReturnValue({ value: "true" });
    await expect(hasInstitutionalPasswordChangedCookie()).resolves.toBe(true);
  });

  it("clears the password changed flash cookie", async () => {
    await clearInstitutionalPasswordChangedCookie();

    expect(cookieStore.delete).toHaveBeenCalledWith(INSTITUTIONAL_PASSWORD_CHANGED_COOKIE);
  });
});
