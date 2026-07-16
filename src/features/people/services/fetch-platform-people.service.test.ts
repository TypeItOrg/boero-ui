import type { PlatformPeoplePaginationParams } from "@features/people/utils/platform-people-pagination.util";

describe("fetchPlatformPeople", () => {
  type ServiceModule = typeof import("@features/people/services/fetch-platform-people.service");

  const platformApiFetchMock = jest.fn<Promise<Response>, [string]>();

  async function importService(): Promise<ServiceModule> {
    jest.doMock("@features/platform-auth/services/platform-api-fetch.service", () => ({
      platformApiFetch: platformApiFetchMock,
    }));

    return import("@features/people/services/fetch-platform-people.service");
  }

  beforeEach(() => {
    jest.resetModules();
    platformApiFetchMock.mockReset();
  });

  it("serializes pagination, search, filters and sort", async () => {
    const payload = { items: [], page: 1, size: 20, totalItems: 0, totalPages: 0 };
    platformApiFetchMock.mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    const params: PlatformPeoplePaginationParams = {
      page: 1,
      size: 20,
      search: "ana",
      institutionId: "22222222-2222-4222-8222-222222222222",
      roleCode: "TEACHER",
      sort: { field: "institutionName", direction: "desc" },
    };

    const { fetchPlatformPeople } = await importService();
    await expect(fetchPlatformPeople(params)).resolves.toEqual(payload);

    const requestUrl = new URL(platformApiFetchMock.mock.calls[0][0], "http://localhost");
    expect(requestUrl.pathname).toBe("/api/v1/admin/people");
    expect(Object.fromEntries(requestUrl.searchParams)).toEqual({
      page: "1",
      size: "20",
      search: "ana",
      sort: "institutionName,desc",
      institutionId: params.institutionId,
      roleCode: "TEACHER",
    });
  });

  it("throws an HTTP error when the backend request fails", async () => {
    platformApiFetchMock.mockResolvedValue(new Response(null, { status: 503 }));
    const { fetchPlatformPeople } = await importService();

    await expect(
      fetchPlatformPeople({
        page: 0,
        size: 10,
        search: "",
        institutionId: undefined,
        roleCode: undefined,
        sort: { field: "lastName", direction: "asc" },
      }),
    ).rejects.toMatchObject({
      message: "No se pudieron obtener los usuarios de la plataforma",
      status: 503,
    });
  });
});
