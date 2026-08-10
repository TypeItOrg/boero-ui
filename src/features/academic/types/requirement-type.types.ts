export type RequirementType = "REQUIRED" | "OPTIONAL";

export const REQUIREMENT_TYPE = ["REQUIRED", "OPTIONAL"] as const satisfies readonly RequirementType[];
