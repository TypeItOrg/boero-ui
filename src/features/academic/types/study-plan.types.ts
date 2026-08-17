import type { StudyPlanStatus } from "@features/academic/types/study-plan-status.types";

export type StudyPlan = {
  id: string;
  institutionId: string;
  trainingPathId: string;
  trainingPathName: string;
  name: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  status: StudyPlanStatus;
  deletedAt?: string | null;
};
