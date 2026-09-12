describe("academic offer service", () => {
  type ServiceModule = typeof import("@features/academic-offers/services/academic-offer.service");

  const institutionalApiFetchMock = jest.fn<Promise<Response>, [string, RequestInit?]>();
  const institutionId = "019e18e4-d919-76d8-9848-7f1b14e64452";

  async function importService(): Promise<ServiceModule> {
    jest.doMock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({
      institutionalApiFetch: institutionalApiFetchMock,
    }));

    return import("@features/academic-offers/services/academic-offer.service");
  }

  beforeEach(() => {
    jest.resetModules();
    institutionalApiFetchMock.mockReset();
  });

  it("requests the paginated offer for the authenticated institution", async () => {
    const payload = { items: [], page: 1, size: 20, totalItems: 0, totalPages: 0 };
    institutionalApiFetchMock.mockResolvedValue(Response.json(payload));

    const { fetchAcademicOffers } = await importService();

    await expect(fetchAcademicOffers(institutionId, { page: 1, size: 20 })).resolves.toEqual(payload);
    expect(institutionalApiFetchMock).toHaveBeenCalledWith(`/api/v1/institutions/${institutionId}/academic-offers?page=1&size=20`);
  });

  it("returns null only when an offer is no longer available", async () => {
    institutionalApiFetchMock.mockResolvedValue(Response.json({}, { status: 404 }));

    const { fetchAcademicOffer } = await importService();

    await expect(fetchAcademicOffer(institutionId, "plan-id")).resolves.toBeNull();
  });
});
