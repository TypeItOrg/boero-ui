import { AcademicScope } from "@features/academic/utils/academic-scope.util";

describe("academic service pagination", () => {
  type ServiceModule = typeof import("@features/academic/services/academic.service");

  const academicApiFetchMock = jest.fn<Promise<Response>, [AcademicScope, string, RequestInit?]>();
  const institutionId = "019e18e4-d919-76d8-9848-7f1b14e64452";

  async function importService(): Promise<ServiceModule> {
    jest.doMock("@features/academic/services/academic-api-fetch.service", () => ({
      academicApiFetch: academicApiFetchMock,
    }));

    return import("@features/academic/services/academic.service");
  }

  beforeEach(() => {
    jest.resetModules();
    academicApiFetchMock.mockReset();
  });

  it("serializes pagination, filters and sort for the academic years endpoint", async () => {
    const payload = { items: [], page: 0, size: 20, totalItems: 0, totalPages: 0 };
    academicApiFetchMock.mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const { fetchAcademicYears } = await importService();
    await expect(
      fetchAcademicYears(AcademicScope.INSTITUTIONAL, institutionId, {
        endDate: "2026-12-15",
        page: 1,
        search: "activo",
        size: 20,
        sort: "startDate,asc",
        startDate: "2026-03-01",
        status: "ACTIVE",
        year: 2026,
      }),
    ).resolves.toEqual(payload);

    const requestUrl = new URL(academicApiFetchMock.mock.calls[0][1], "http://localhost");
    expect(requestUrl.pathname).toBe(`/api/v1/institutions/${institutionId}/academic-years`);
    expect(Object.fromEntries(requestUrl.searchParams)).toEqual({
      endDate: "2026-12-15",
      page: "1",
      search: "activo",
      size: "20",
      sort: "startDate,asc",
      startDate: "2026-03-01",
      status: "ACTIVE",
      year: "2026",
    });
  });

  it("serializes name sorting for the training paths endpoint", async () => {
    const payload = { items: [], page: 0, size: 10, totalItems: 0, totalPages: 0 };
    academicApiFetchMock.mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const { fetchTrainingPaths } = await importService();
    await expect(
      fetchTrainingPaths(AcademicScope.INSTITUTIONAL, institutionId, {
        active: true,
        page: 0,
        search: "Tecnicatura",
        size: 10,
        sort: "name,desc",
      }),
    ).resolves.toEqual(payload);

    const requestUrl = new URL(academicApiFetchMock.mock.calls[0][1], "http://localhost");
    expect(requestUrl.pathname).toBe(`/api/v1/institutions/${institutionId}/training-paths`);
    expect(Object.fromEntries(requestUrl.searchParams)).toEqual({
      active: "true",
      page: "0",
      search: "Tecnicatura",
      size: "10",
      sort: "name,desc",
    });
  });
});
