describe("getPlatformAccount", () => {
  type GetPlatformAccountModule = typeof import("@features/platform-auth/services/get-platform-account.service");

  const originalApiUrl = process.env.BOERO_API_URL;
  const originalBaseDomain = process.env.INSTITUTIONAL_BASE_DOMAIN;
  const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

  function mockAccessToken(accessToken: string | undefined): void {
    jest.doMock("@features/platform-auth/services/get-platform-access-token.service", () => ({
      getPlatformAccessToken: jest.fn().mockResolvedValue(accessToken),
    }));
  }

  async function importService(): Promise<GetPlatformAccountModule> {
    return import("@features/platform-auth/services/get-platform-account.service");
  }

  beforeEach(() => {
    process.env.BOERO_API_URL = "https://api.example.test";
    jest.resetModules();
    process.env.INSTITUTIONAL_BASE_DOMAIN = "";
    jest.doMock("next/headers", () => ({
      headers: jest.fn().mockResolvedValue(new Headers({ host: "localhost:3000" })),
    }));
    global.fetch = fetchMock;
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  afterAll(() => {
    process.env.BOERO_API_URL = originalApiUrl;

    if (originalBaseDomain === undefined) {
      delete process.env.INSTITUTIONAL_BASE_DOMAIN;
    } else {
      process.env.INSTITUTIONAL_BASE_DOMAIN = originalBaseDomain;
    }
  });

  it("returns null when there is no access token", async () => {
    mockAccessToken(undefined);

    const { getPlatformAccount } = await importService();
    await expect(getPlatformAccount()).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns null when the backend response is not ok", async () => {
    mockAccessToken("access-token");
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    const { getPlatformAccount } = await importService();
    await expect(getPlatformAccount()).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(new URL("/api/v1/admin/auth/me", "https://api.example.test"), {
      headers: { Authorization: "Bearer access-token" },
      cache: "no-store",
    });
  });

  it("returns the account payload when the backend call succeeds", async () => {
    const payload = {
      account: {
        platformAccountId: "1",
        email: "user@example.com",
        name: "User",
        lastName: "Example",
      },
    };

    mockAccessToken("access-token");
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const { getPlatformAccount } = await importService();
    await expect(getPlatformAccount()).resolves.toEqual(payload.account);
  });
});
