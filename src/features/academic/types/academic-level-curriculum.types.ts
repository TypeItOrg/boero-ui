import type { AcademicLevel } from "@features/academic/types/academic-level.types";
import type { StudyPlanSpace } from "@features/academic/types/study-plan-space.types";

export type AcademicLevelCurriculum = {
  level: AcademicLevel;
  spaces: StudyPlanSpace[];
};
