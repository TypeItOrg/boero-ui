import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { AcademicScope, getAcademicApiBase, getAcademicResourceRoute, getAcademicRouteBase } from "@features/academic/utils/academic-scope.util";

describe("academic scope", () => {
  const institutionId = "11111111-1111-1111-1111-111111111111";

  it("builds institutional API and page paths", () => {
    expect(getAcademicApiBase(AcademicScope.INSTITUTIONAL, institutionId)).toBe(`/api/v1/institutions/${institutionId}`);
    expect(getAcademicRouteBase(AcademicScope.INSTITUTIONAL, institutionId)).toBe("");
    expect(getAcademicResourceRoute(AcademicScope.INSTITUTIONAL, institutionId, AcademicResource.ACADEMIC_YEAR)).toBe("/academic-years");
    expect(getAcademicResourceRoute(AcademicScope.INSTITUTIONAL, institutionId, AcademicResource.ACADEMIC_LEVEL)).toBe("/study-plans");
  });

  it("builds platform administration API and page paths", () => {
    expect(getAcademicApiBase(AcademicScope.ADMIN, institutionId)).toBe(`/api/v1/admin/institutions/${institutionId}`);
    expect(getAcademicRouteBase(AcademicScope.ADMIN, institutionId)).toBe(`/admin/institutions/${institutionId}/academic`);
  });
});
