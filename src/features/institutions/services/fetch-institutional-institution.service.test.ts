describe("fetchInstitutionalInstitution", () => {
  type ServiceModule = typeof import("@features/institutions/services/fetch-institutional-institution.service");

  const institutionalApiFetchMock = jest.fn<Promise<Response>, [string]>();

  async function importService(): Promise<ServiceModule> {
    jest.doMock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({
      institutionalApiFetch: institutionalApiFetchMock,
    }));

    return import("@features/institutions/services/fetch-institutional-institution.service");
  }

  beforeEach(() => {
    jest.resetModules();
    institutionalApiFetchMock.mockReset();
  });

  it("returns null for a non-ok response", async () => {
    institutionalApiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    const { fetchInstitutionalInstitution } = await importService();

    await expect(fetchInstitutionalInstitution("inst-1")).resolves.toBeNull();
  });

  it("returns institution detail when response is ok", async () => {
    const mockInstitution = { id: "inst-1", name: "Conservatorio Boero" };
    institutionalApiFetchMock.mockResolvedValue(
      new Response(JSON.stringify(mockInstitution), { status: 200, headers: { "Content-Type": "application/json" } }),
    );

    const { fetchInstitutionalInstitution } = await importService();

    await expect(fetchInstitutionalInstitution("inst-1")).resolves.toEqual(mockInstitution);
    expect(institutionalApiFetchMock).toHaveBeenCalledWith("/api/v1/institutions/inst-1");
  });
});
