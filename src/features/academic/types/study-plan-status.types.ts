export type StudyPlanStatus = "DRAFT" | "ACTIVE" | "INACTIVE";

export const STUDY_PLAN_STATUS = ["DRAFT", "ACTIVE", "INACTIVE"] as const satisfies readonly StudyPlanStatus[];
