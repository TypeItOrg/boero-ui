import { fetchAcademicOptionPage } from "@features/academic/services/academic-options.service";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";

describe("fetchAcademicOptionPage", () => {
  const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();
  const originalFetch = global.fetch;
  const institutionId = "019e18e4-d919-76d8-9848-7f1b14e64452";

  beforeEach(() => {
    global.fetch = fetchMock;
    fetchMock.mockResolvedValue(Response.json({ items: [], page: 0, totalPages: 1 }));
  });

  afterEach(() => fetchMock.mockReset());
  afterAll(() => {
    global.fetch = originalFetch;
  });

  it.each([AcademicScope.ADMIN, AcademicScope.INSTITUTIONAL])("uses the %s BFF namespace", async (scope) => {
    const signal = new AbortController().signal;

    await expect(
      fetchAcademicOptionPage("training-paths", scope, institutionId, {
        page: 0,
        search: "Tecnicatura",
        signal,
        size: 20,
      }),
    ).resolves.toEqual({ items: [], nextPage: null });

    expect(fetchMock).toHaveBeenCalledWith(
      `/api/${scope}/academic/options/training-paths?institutionId=${institutionId}&page=0&search=Tecnicatura&size=20`,
      { cache: "no-store", signal },
    );
  });

  it.each([
    [0, 3, 1],
    [1, 3, 2],
    [2, 3, null],
    [0, 0, null],
  ])("maps backend page %s of %s to nextPage %s", async (page, totalPages, nextPage) => {
    const items = [{ id: "path-1", name: "Tecnicatura" }];
    fetchMock.mockResolvedValue(Response.json({ items, page, totalPages }));

    await expect(
      fetchAcademicOptionPage(
        "training-paths",
        AcademicScope.INSTITUTIONAL,
        institutionId,
        {
          page,
          size: 20,
          search: "piano & voz",
          signal: new AbortController().signal,
        },
        { active: false, published: true, trainingPathId: "path-1", operation: "COURSE_CREATE", status: "ACTIVE" },
      ),
    ).resolves.toEqual({ items, nextPage });

    const url = new URL(String(fetchMock.mock.calls[0][0]), "http://localhost");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      institutionId,
      page: String(page),
      size: "20",
      search: "piano & voz",
      active: "false",
      published: "true",
      trainingPathId: "path-1",
      operation: "COURSE_CREATE",
      status: "ACTIVE",
    });
  });

  it("reports backend failures instead of returning empty options", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 503 }));

    await expect(
      fetchAcademicOptionPage("training-paths", AcademicScope.INSTITUTIONAL, institutionId, {
        page: 0,
        size: 20,
        search: "",
        signal: new AbortController().signal,
      }),
    ).rejects.toMatchObject({ status: 503, message: "No se pudieron cargar las opciones académicas." });
  });
});
