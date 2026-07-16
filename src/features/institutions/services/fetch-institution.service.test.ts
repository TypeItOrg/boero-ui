describe("fetchInstitution", () => {
  type ServiceModule = typeof import("@features/institutions/services/fetch-institution.service");

  const platformApiFetchMock = jest.fn<Promise<Response>, [string]>();

  async function importService(): Promise<ServiceModule> {
    jest.doMock("@features/platform-auth/services/platform-api-fetch.service", () => ({
      platformApiFetch: platformApiFetchMock,
    }));

    return import("@features/institutions/services/fetch-institution.service");
  }

  beforeEach(() => {
    jest.resetModules();
    platformApiFetchMock.mockReset();
  });

  it("returns null for a missing institution", async () => {
    platformApiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    const { fetchInstitution } = await importService();

    await expect(fetchInstitution("institution-id")).resolves.toBeNull();
  });
});
