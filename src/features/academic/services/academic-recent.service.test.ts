import {
  fetchAcademicSpaces,
  fetchAcademicYears,
  fetchInstruments,
  fetchStudyPlans,
  fetchTrainingPaths,
} from "@features/academic/services/academic.service";
import { fetchAcademicRecentItems } from "@features/academic/services/academic-recent.service";
import type { AcademicAccess } from "@features/academic/types/academic-access.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";

jest.mock("@features/academic/services/academic.service", () => ({
  fetchAcademicSpaces: jest.fn(),
  fetchAcademicYears: jest.fn(),
  fetchInstruments: jest.fn(),
  fetchStudyPlans: jest.fn(),
  fetchTrainingPaths: jest.fn(),
}));

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
};

describe("fetchAcademicRecentItems", () => {
  it("loads only readable sections ordered by creation date", async () => {
    jest.mocked(fetchAcademicYears).mockResolvedValue(
      page([
        {
          id: "year-id",
          institutionId: INSTITUTION_ID,
          year: 2028,
          startDate: null,
          endDate: null,
          status: "PLANNED",
        },
      ]),
    );
    jest.mocked(fetchAcademicSpaces).mockResolvedValue(page([]));
    jest
      .mocked(fetchInstruments)
      .mockResolvedValue(page([{ id: "instrument-id", institutionId: INSTITUTION_ID, name: "Piano", description: null, active: true }]));

    const items = await fetchAcademicRecentItems(AcademicScope.INSTITUTIONAL, INSTITUTION_ID, ACCESS);

    expect(fetchAcademicYears).toHaveBeenCalledWith(AcademicScope.INSTITUTIONAL, INSTITUTION_ID, {
      page: 0,
      size: 1,
      sort: "createdAt,desc",
    });
    expect(fetchTrainingPaths).not.toHaveBeenCalled();
    expect(fetchStudyPlans).not.toHaveBeenCalled();
    expect(items).toEqual([
      expect.objectContaining({ resource: AcademicResource.ACADEMIC_YEAR, label: "2028" }),
      expect.objectContaining({ resource: AcademicResource.INSTRUMENT, label: "Piano" }),
    ]);
  });
});

function page<T>(items: T[]) {
  return { items, page: 0, size: 1, totalItems: items.length, totalPages: items.length > 0 ? 1 : 0 };
}
