export type RequirementStage = "TO_ENROLL" | "TO_PASS";

export const REQUIREMENT_STAGE = ["TO_ENROLL", "TO_PASS"] as const satisfies readonly RequirementStage[];
