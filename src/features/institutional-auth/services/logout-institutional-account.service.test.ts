describe("logoutInstitutionalAccount", () => {
  type LogoutInstitutionalAccountModule =
    typeof import("@features/institutional-auth/services/logout-institutional-account.service");

  const originalApiUrl = process.env.BOERO_API_URL;
  const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

  function mockAccessToken(accessToken: string | undefined): void {
    jest.doMock("@features/institutional-auth/services/get-institutional-access-token.service", () => ({
      getInstitutionalAccessToken: jest.fn().mockResolvedValue(accessToken),
    }));
  }

  async function importService(): Promise<LogoutInstitutionalAccountModule> {
    return import("@features/institutional-auth/services/logout-institutional-account.service");
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

    const { logoutInstitutionalAccount } = await importService();
    await logoutInstitutionalAccount();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts logout with the institutional bearer token", async () => {
    mockAccessToken("access-token");
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    const { logoutInstitutionalAccount } = await importService();
    await logoutInstitutionalAccount();

    expect(fetchMock).toHaveBeenCalledWith(new URL("/api/v1/auth/logout", "https://api.example.test"), {
      method: "POST",
      headers: { Authorization: "Bearer access-token" },
      cache: "no-store",
    });
  });

  it("does not throw when the backend request fails", async () => {
    mockAccessToken("access-token");
    fetchMock.mockRejectedValue(new Error("network"));

    const { logoutInstitutionalAccount } = await importService();

    await expect(logoutInstitutionalAccount()).resolves.toBeUndefined();
  });
});
