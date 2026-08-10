import type { AcademicYear } from "@features/academic/types/academic-year.types";
import type { StudyPlan } from "@features/academic/types/study-plan.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { canChangeAcademicStatus, canEditAcademicResource } from "@features/academic/utils/academic-state.util";

const ACADEMIC_YEAR = {
  id: "year-id",
  institutionId: "institution-id",
  year: 2026,
  startDate: null,
  endDate: null,
  status: "PLANNED",
} satisfies AcademicYear;

const STUDY_PLAN = {
  id: "plan-id",
  institutionId: "institution-id",
  trainingPathId: "path-id",
  trainingPathName: "Trayecto",
  name: "Plan",
  effectiveFrom: null,
  effectiveTo: null,
  status: "DRAFT",
} satisfies StudyPlan;

describe("academic state rules", () => {
  it("allows editing planned academic years and draft study plans", () => {
    expect(canEditAcademicResource(AcademicResource.ACADEMIC_YEAR, ACADEMIC_YEAR)).toBe(true);
    expect(canEditAcademicResource(AcademicResource.STUDY_PLAN, STUDY_PLAN)).toBe(true);
  });

  it("hides editing for closed years and inactive plans", () => {
    expect(canEditAcademicResource(AcademicResource.ACADEMIC_YEAR, { ...ACADEMIC_YEAR, status: "CLOSED" })).toBe(false);
    expect(canEditAcademicResource(AcademicResource.STUDY_PLAN, { ...STUDY_PLAN, status: "INACTIVE" })).toBe(false);
  });

  it("does not offer terminal status transitions", () => {
    expect(canChangeAcademicStatus(AcademicResource.ACADEMIC_YEAR, { ...ACADEMIC_YEAR, status: "CLOSED" })).toBe(false);
    expect(canChangeAcademicStatus(AcademicResource.STUDY_PLAN, { ...STUDY_PLAN, status: "INACTIVE" })).toBe(false);
  });
});
