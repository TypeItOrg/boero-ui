import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import { fetchAcademicRecentItems } from "@features/academic/services/academic-recent.service";
import type { AcademicAccess } from "@features/academic/types/academic-access.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";

jest.mock("@features/academic/services/academic-api-fetch.service", () => ({ academicApiFetch: jest.fn() }));

const INSTITUTION_ID = "05b84ac4-66aa-409f-a813-012d15b8cb9b";
const ACCESS: AcademicAccess = {
  yearRead: true,
  yearCreate: false,
  yearUpdate: false,
  yearStatusUpdate: false,
  yearDelete: false,
  yearRestore: false,
  trainingPathRead: false,
  trainingPathCreate: false,
  trainingPathUpdate: false,
  trainingPathStatusUpdate: false,
  trainingPathDelete: false,
  trainingPathRestore: false,
  studyPlanRead: false,
  studyPlanCreate: false,
  studyPlanUpdate: false,
  studyPlanStatusUpdate: false,
  studyPlanCurriculumUpdate: false,
  studyPlanDelete: false,
  studyPlanRestore: false,
  academicSpaceRead: true,
  academicSpaceCreate: false,
  academicSpaceUpdate: false,
  academicSpaceStatusUpdate: false,
  academicSpaceDelete: false,
  academicSpaceRestore: false,
  instrumentRead: true,
  instrumentCreate: false,
  instrumentUpdate: false,
  instrumentStatusUpdate: false,
  instrumentDelete: false,
  instrumentRestore: false,
  courseRead: false,
  courseCreate: false,
  courseUpdate: false,
  courseStatusUpdate: false,
  courseDelete: false,
  courseRestore: false,
  shiftRead: false,
  shiftCreate: false,
  shiftUpdate: false,
  shiftStatusUpdate: false,
  shiftDelete: false,
  shiftRestore: false,
};

it("requests only readable sections through the real academic services and returns complete recent entries", async () => {
  const year = { id: "year-id", institutionId: INSTITUTION_ID, year: 2028, startDate: null, endDate: null, status: "PLANNED" };
  const instrument = { id: "instrument-id", institutionId: INSTITUTION_ID, name: "Piano", description: null, active: false };
  jest
    .mocked(academicApiFetch)
    .mockReset()
    .mockImplementation(async (_scope, path) => {
      const resource = new URL(path, "https://boero.test").pathname.split("/").at(-1);
      const items = resource === "academic-years" ? [year] : resource === "instruments" ? [instrument] : [];

      return Response.json({ items, page: 0, size: 1, totalItems: items.length, totalPages: items.length });
    });

  const items = await fetchAcademicRecentItems(AcademicScope.INSTITUTIONAL, INSTITUTION_ID, ACCESS);

  expect(academicApiFetch).toHaveBeenCalledTimes(3);
  expect(
    jest.mocked(academicApiFetch).mock.calls.map(([scope, path]) => {
      expect(scope).toBe("institutional");
      const url = new URL(path, "https://boero.test");
      expect(Object.fromEntries(url.searchParams)).toEqual({ page: "0", size: "1", sort: "createdAt,desc" });

      return url.pathname;
    }),
  ).toEqual([
    "/api/v1/institutions/" + INSTITUTION_ID + "/academic-years",
    "/api/v1/institutions/" + INSTITUTION_ID + "/academic-spaces",
    "/api/v1/institutions/" + INSTITUTION_ID + "/instruments",
  ]);
  expect(items).toEqual([
    { id: "year-id", label: "2028", active: false, detail: "Planificado", resource: "academic-years", section: "Ciclos lectivos" },
    { id: "instrument-id", label: "Piano", active: false, detail: "Inactivo", resource: "instruments", section: "Instrumentos" },
  ]);
});
