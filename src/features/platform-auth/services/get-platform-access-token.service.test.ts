import { cookies } from "next/headers";

import { getPlatformAccessToken } from "@features/platform-auth/services/get-platform-access-token.service";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

describe("getPlatformAccessToken", () => {
  it.each([
    ["present", { platform_access_token: "platform-token", institutional_access_token: "institutional-token" }, "platform-token"],
    ["missing", { institutional_access_token: "institutional-token" }, undefined],
  ] as const)("returns the platform cookie when %s without borrowing the institutional session", async (_case, values, expected) => {
    jest.mocked(cookies).mockResolvedValue({
      get: (name: string) => {
        const value = (values as Record<string, string>)[name];

        return value === undefined ? undefined : { name, value };
      },
    } as Awaited<ReturnType<typeof cookies>>);

    await expect(getPlatformAccessToken()).resolves.toBe(expected);
  });
});
