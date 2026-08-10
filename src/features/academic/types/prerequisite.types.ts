import type { RequiredCondition } from "@features/academic/types/required-condition.types";
import type { RequirementStage } from "@features/academic/types/requirement-stage.types";

export type Prerequisite = {
  id: string;
  studyPlanId: string;
  targetStudyPlanSpaceId: string;
  requiredStudyPlanSpaceId: string;
  requirementStage: RequirementStage;
  requiredCondition: RequiredCondition;
};
