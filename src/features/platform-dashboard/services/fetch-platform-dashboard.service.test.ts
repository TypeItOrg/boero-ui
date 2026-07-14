describe("fetchPlatformDashboard", () => {
  type ServiceModule = typeof import("@features/platform-dashboard/services/fetch-platform-dashboard.service");

  const platformApiFetchMock = jest.fn<Promise<Response>, [string]>();

  async function importService(): Promise<ServiceModule> {
    jest.doMock("@features/platform-auth/services/platform-api-fetch.service", () => ({
      platformApiFetch: platformApiFetchMock,
    }));

    return import("@features/platform-dashboard/services/fetch-platform-dashboard.service");
  }

  beforeEach(() => {
    jest.resetModules();
  });

  it("returns the dashboard payload", async () => {
    const payload = {
      summary: {
        institutions: 12,
        activeInstitutions: 10,
        inactiveInstitutions: 2,
        people: 45,
        usersWithAccess: 31,
      },
      institutionRegistrations: [{ year: 2026, month: 7, count: 2 }],
      recentInstitutions: [],
    };
    platformApiFetchMock.mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const { fetchPlatformDashboard } = await importService();

    await expect(fetchPlatformDashboard()).resolves.toEqual(payload);
    expect(platformApiFetchMock).toHaveBeenCalledWith("/api/v1/platform/dashboard");
  });

  it("throws an HTTP error when the backend call fails", async () => {
    platformApiFetchMock.mockResolvedValue(new Response(null, { status: 503 }));

    const { fetchPlatformDashboard } = await importService();

    await expect(fetchPlatformDashboard()).rejects.toMatchObject({
      message: "No se pudo obtener el resumen de la plataforma",
      status: 503,
    });
  });
});
