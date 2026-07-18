jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

import { cookies } from "next/headers";

import {
  clearInstitutionalAuthCookies,
  INSTITUTIONAL_ACCESS_TOKEN_COOKIE,
  INSTITUTIONAL_ACCESS_TOKEN_MAX_AGE,
  INSTITUTIONAL_REFRESH_TOKEN_COOKIE,
  INSTITUTIONAL_REFRESH_TOKEN_MAX_AGE,
  INSTITUTIONAL_REMEMBER_ME_MAX_AGE,
  setInstitutionalAuthCookies,
} from "@features/institutional-auth/utils/institutional-auth-cookies.util";

describe("institutional auth cookies", () => {
  const cookieStore = {
    delete: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(() => {
    jest.mocked(cookies).mockResolvedValue(cookieStore as never);
    cookieStore.delete.mockReset();
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
});
