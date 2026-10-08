import { STUDY_PLAN_STATUS } from "@features/academic/types/study-plan-status.types";
import { studyPlanStatusLabels } from "@features/academic/utils/academic-labels.util";

export const STUDY_PLAN_STATUS_OPTIONS = STUDY_PLAN_STATUS.filter((status) => status !== "INACTIVE").map((status) => ({
  value: status,
  label: studyPlanStatusLabels[status],
}));
