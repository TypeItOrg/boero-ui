import type { TeachersPaginationParams } from "@features/people/utils/teachers-pagination.util";
import { PeopleScope } from "@features/people/utils/people-scope.util";

describe("fetchInstitutionTeachers", () => {
  type ServiceModule = typeof import("@features/people/services/fetch-institution-teachers.service");
  const peopleApiFetchMock = jest.fn<Promise<Response>, [string, string, RequestInit?]>();

  async function importService(): Promise<ServiceModule> {
    jest.doMock("@features/people/services/people-api-fetch.service", () => ({
      peopleApiFetch: peopleApiFetchMock,
    }));

    return import("@features/people/services/fetch-institution-teachers.service");
  }

  beforeEach(() => {
    jest.resetModules();
    peopleApiFetchMock.mockReset();
  });

  it("serializes pagination, search and sort for the institutional teachers endpoint", async () => {
    const payload = { items: [], page: 1, size: 20, totalItems: 0, totalPages: 0 };
    peopleApiFetchMock.mockResolvedValue(Response.json(payload));
    const params: TeachersPaginationParams = {
      page: 1,
      size: 20,
      search: "ana",
      sort: { field: "lastName", direction: "desc" },
    };

    const { fetchInstitutionTeachers } = await importService();
    await expect(fetchInstitutionTeachers("institution-1", params)).resolves.toEqual(payload);

    expect(peopleApiFetchMock).toHaveBeenCalledWith(
      PeopleScope.INSTITUTIONAL,
      expect.stringContaining("/api/v1/institutions/institution-1/teachers"),
    );
    const requestUrl = new URL(peopleApiFetchMock.mock.calls[0]?.[1] ?? "", "http://localhost");
    expect(requestUrl.pathname).toBe("/api/v1/institutions/institution-1/teachers");
    expect(Object.fromEntries(requestUrl.searchParams)).toEqual({
      page: "1",
      size: "20",
      search: "ana",
      sort: "lastName,desc",
    });
  });

  it("throws the feature error when the backend request fails", async () => {
    peopleApiFetchMock.mockResolvedValue(new Response(null, { status: 503 }));
    const { fetchInstitutionTeachers } = await importService();

    await expect(
      fetchInstitutionTeachers("institution-1", {
        page: 0,
        size: 10,
        search: "",
        sort: { field: "lastName", direction: "asc" },
      }),
    ).rejects.toMatchObject({
      message: "No se pudieron obtener los docentes de la institución",
      status: 503,
    });
  });
});
