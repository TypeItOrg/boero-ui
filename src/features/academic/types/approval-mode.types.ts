export type ApprovalMode = "PROMOTION" | "FINAL_EXAM" | "PROMOTION_OR_FINAL_EXAM";

export const APPROVAL_MODE = [
  "PROMOTION",
  "FINAL_EXAM",
  "PROMOTION_OR_FINAL_EXAM",
] as const satisfies readonly ApprovalMode[];
