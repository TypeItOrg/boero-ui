jest.mock("@features/academic/services/academic-api-fetch.service", () => ({ academicApiFetch: jest.fn() }));

import { GET as getAdminAcademicOptions } from "@app/api/admin/academic/options/[resource]/route";
import { GET as getInstitutionalAcademicOptions } from "@app/api/institutional/academic/options/[resource]/route";
import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";

describe("academic options routes", () => {
  const academicApiFetchMock = jest.mocked(academicApiFetch);
  const institutionId = "019e18e4-d919-76d8-9848-7f1b14e64452";

  beforeEach(() => academicApiFetchMock.mockReset());

  it.each([
    {
      get: getAdminAcademicOptions,
      routePath: "/api/admin/academic/options/training-paths",
      scope: AcademicScope.ADMIN,
      backendBasePath: `/api/v1/admin/institutions/${institutionId}`,
      conflictingScope: AcademicScope.INSTITUTIONAL,
    },
    {
      get: getInstitutionalAcademicOptions,
      routePath: "/api/institutional/academic/options/training-paths",
      scope: AcademicScope.INSTITUTIONAL,
      backendBasePath: `/api/v1/institutions/${institutionId}`,
      conflictingScope: AcademicScope.ADMIN,
    },
  ])(
    "uses the $scope session selected by the route",
    async ({ get, routePath, scope, backendBasePath, conflictingScope }) => {
      academicApiFetchMock.mockResolvedValue(Response.json({ items: [], page: 1, totalPages: 1 }));
      const request = new Request(
        `http://localhost${routePath}?institutionId=${institutionId}&page=1&size=20&search=Tecnicatura&scope=${conflictingScope}`,
      );

      const response = await get(request, { params: Promise.resolve({ resource: "training-paths" }) });

      expect(response.status).toBe(200);
      expect(academicApiFetchMock).toHaveBeenCalledTimes(1);

      const call = academicApiFetchMock.mock.calls[0];
      expect(call).toBeDefined();
      if (!call) return;

      const [receivedScope, receivedPath, receivedInit] = call;
      const receivedUrl = new URL(receivedPath, "http://localhost");

      expect(receivedScope).toBe(scope);
      expect(receivedUrl.pathname).toBe(`${backendBasePath}/training-paths`);
      expect(Object.fromEntries(receivedUrl.searchParams)).toEqual({
        active: "true",
        page: "1",
        search: "Tecnicatura",
        size: "20",
        sort: "name,asc",
      });
      expect(receivedInit).toEqual({ signal: request.signal });
    },
  );

  it("rejects an unsupported option resource", async () => {
    const request = new Request(
      `http://localhost/api/institutional/academic/options/instruments?institutionId=${institutionId}`,
    );

    const response = await getInstitutionalAcademicOptions(request, {
      params: Promise.resolve({ resource: "instruments" }),
    });

    expect(response.status).toBe(400);
    expect(academicApiFetchMock).not.toHaveBeenCalled();
  });
});
