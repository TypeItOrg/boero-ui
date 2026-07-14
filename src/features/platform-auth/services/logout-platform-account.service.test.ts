describe("logoutPlatformAccount", () => {
  type LogoutPlatformAccountModule = typeof import("@features/platform-auth/services/logout-platform-account.service");

  const originalApiUrl = process.env.BOERO_API_URL;
  const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

  function mockAccessToken(accessToken: string | undefined): void {
    jest.doMock("@features/platform-auth/services/get-platform-access-token.service", () => ({
      getPlatformAccessToken: jest.fn().mockResolvedValue(accessToken),
    }));
  }

  function mockClearPlatformAuthCookies(): jest.Mock {
    const clearPlatformAuthCookies = jest.fn();

    jest.doMock("@features/platform-auth/utils/platform-auth-cookies.util", () => ({
      clearPlatformAuthCookies,
    }));

    return clearPlatformAuthCookies;
  }

  async function importService(): Promise<LogoutPlatformAccountModule> {
    return import("@features/platform-auth/services/logout-platform-account.service");
  }

  beforeEach(() => {
    process.env.BOERO_API_URL = "https://api.example.test";
    jest.resetModules();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  afterAll(() => {
    process.env.BOERO_API_URL = originalApiUrl;
  });

  it("does nothing when there is no access token", async () => {
    mockAccessToken(undefined);
    const clearPlatformAuthCookies = mockClearPlatformAuthCookies();

    const { logoutPlatformAccount } = await importService();
    await logoutPlatformAccount();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(clearPlatformAuthCookies).not.toHaveBeenCalled();
  });

  it("posts logout with the bearer token", async () => {
    mockAccessToken("access-token");
    const clearPlatformAuthCookies = mockClearPlatformAuthCookies();
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    const { logoutPlatformAccount } = await importService();
    await logoutPlatformAccount();

    expect(fetchMock).toHaveBeenCalledWith(new URL("/api/v1/auth/platform/logout", "https://api.example.test"), {
      method: "POST",
      headers: { Authorization: "Bearer access-token" },
      cache: "no-store",
    });
    expect(clearPlatformAuthCookies).not.toHaveBeenCalled();
  });

  it("clears cookies when the backend request throws", async () => {
    mockAccessToken("access-token");
    const clearPlatformAuthCookies = mockClearPlatformAuthCookies();
    fetchMock.mockRejectedValue(new Error("network"));

    const { logoutPlatformAccount } = await importService();
    await logoutPlatformAccount();

    expect(clearPlatformAuthCookies).toHaveBeenCalled();
  });
});
