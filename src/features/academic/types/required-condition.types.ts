export type RequiredCondition = "REGULAR" | "PASSED";

export const REQUIRED_CONDITION = ["REGULAR", "PASSED"] as const satisfies readonly RequiredCondition[];
