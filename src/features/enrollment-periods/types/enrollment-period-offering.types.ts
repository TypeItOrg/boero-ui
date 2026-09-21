import type { AcademicLevel } from "@features/academic/types/academic-level.types";
export type EnrollmentPeriodOffering = {
  studyPlanId: string;
  studyPlanName: string;
  versionNumber: number;
  trainingPathId: string;
  trainingPathName: string;
  academicLevels: AcademicLevel[];
  includeUnassigned: boolean;
};
