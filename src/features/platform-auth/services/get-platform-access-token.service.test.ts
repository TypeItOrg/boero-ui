jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

import { cookies } from "next/headers";
import { getPlatformAccessToken } from "@features/platform-auth/services/get-platform-access-token.service";
import { PLATFORM_ACCESS_TOKEN_COOKIE } from "@features/platform-auth/utils/platform-auth-cookies.util";

describe("getPlatformAccessToken", () => {
  const cookiesMock = jest.mocked(cookies);
  const createCookieStore = (get: jest.Mock): Awaited<ReturnType<typeof cookies>> =>
    ({
      [Symbol.iterator]: function* iterator() {},
      get,
      getAll: jest.fn(),
      has: jest.fn(),
      size: 0,
    }) as unknown as Awaited<ReturnType<typeof cookies>>;

  afterEach(() => {
    cookiesMock.mockReset();
  });

  it("returns the platform access token cookie value", async () => {
    cookiesMock.mockResolvedValue(createCookieStore(jest.fn().mockReturnValue({ value: "access-token" })));

    await expect(getPlatformAccessToken()).resolves.toBe("access-token");
  });

  it("returns undefined when the cookie is missing", async () => {
    cookiesMock.mockResolvedValue(createCookieStore(jest.fn().mockReturnValue(undefined)));

    await expect(getPlatformAccessToken()).resolves.toBeUndefined();
    expect(cookiesMock).toHaveBeenCalled();
  });

  it("reads the expected cookie name", async () => {
    const get = jest.fn().mockReturnValue({ value: "access-token" });

    cookiesMock.mockResolvedValue(createCookieStore(get));

    await getPlatformAccessToken();

    expect(get).toHaveBeenCalledWith(PLATFORM_ACCESS_TOKEN_COOKIE);
  });
});
