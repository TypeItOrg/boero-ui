import { fetchAcademicOptionPage } from "@features/academic/services/academic-options.service";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";

describe("fetchAcademicOptionPage", () => {
  const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();
  const institutionId = "019e18e4-d919-76d8-9848-7f1b14e64452";

  beforeEach(() => {
    global.fetch = fetchMock;
    fetchMock.mockResolvedValue(Response.json({ items: [], page: 0, totalPages: 1 }));
  });

  afterEach(() => fetchMock.mockReset());

  it.each([AcademicScope.ADMIN, AcademicScope.INSTITUTIONAL])("uses the %s BFF namespace", async (scope) => {
    const signal = new AbortController().signal;

    await fetchAcademicOptionPage("training-paths", scope, institutionId, {
      page: 0,
      search: "Tecnicatura",
      signal,
      size: 20,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `/api/${scope}/academic/options/training-paths?institutionId=${institutionId}&page=0&search=Tecnicatura&size=20`,
      { signal },
    );
  });
});
