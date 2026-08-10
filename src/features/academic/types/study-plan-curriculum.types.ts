import type { AcademicLevelCurriculum } from "@features/academic/types/academic-level-curriculum.types";
import type { Prerequisite } from "@features/academic/types/prerequisite.types";
import type { StudyPlan } from "@features/academic/types/study-plan.types";
import type { StudyPlanSpace } from "@features/academic/types/study-plan-space.types";

export type StudyPlanCurriculum = {
  studyPlan: StudyPlan;
  levels: AcademicLevelCurriculum[];
  unassignedSpaces: StudyPlanSpace[];
  prerequisites: Prerequisite[];
};
