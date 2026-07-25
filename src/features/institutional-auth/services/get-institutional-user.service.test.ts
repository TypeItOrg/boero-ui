describe("getInstitutionalUser", () => {
  type GetInstitutionalUserModule =
    typeof import("@features/institutional-auth/services/get-institutional-user.service");

  const originalApiUrl = process.env.BOERO_API_URL;
  const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

  function mockAccessToken(accessToken: string | undefined): void {
    jest.doMock("@features/institutional-auth/services/get-institutional-access-token.service", () => ({
      getInstitutionalAccessToken: jest.fn().mockResolvedValue(accessToken),
    }));
  }

  async function importService(): Promise<GetInstitutionalUserModule> {
    return import("@features/institutional-auth/services/get-institutional-user.service");
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

  it("returns null without an access token", async () => {
    mockAccessToken(undefined);

    const { getInstitutionalUser } = await importService();
    await expect(getInstitutionalUser()).resolves.toBeNull();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns null when the backend rejects the session", async () => {
    mockAccessToken("access-token");
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    const { getInstitutionalUser } = await importService();
    await expect(getInstitutionalUser()).resolves.toBeNull();

    expect(fetchMock).toHaveBeenCalledWith(new URL("/api/v1/auth/me", "https://api.example.test"), {
      headers: { Authorization: "Bearer access-token" },
      cache: "no-store",
    });
  });

  it("returns the current institutional user", async () => {
    const user = {
      userId: "user-id",
      personId: "person-id",
      name: "Ana",
      lastName: "García",
      documentNumber: "12345678",
      institutionId: "institution-id",
      roles: [],
      permissions: [],
    };

    mockAccessToken("access-token");
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ user }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const { getInstitutionalUser } = await importService();
    await expect(getInstitutionalUser()).resolves.toEqual(user);
  });

  it("propagates network failures instead of treating them as logout", async () => {
    mockAccessToken("access-token");
    fetchMock.mockRejectedValue(new Error("network"));

    const { getInstitutionalUser } = await importService();
    await expect(getInstitutionalUser()).rejects.toThrow("network");
  });
});
