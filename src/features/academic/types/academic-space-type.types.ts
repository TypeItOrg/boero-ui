export type AcademicSpaceType = "SUBJECT" | "WORKSHOP" | "SEMINAR" | "PRACTICE" | "OTHER";

export const ACADEMIC_SPACE_TYPE = ["SUBJECT", "WORKSHOP", "SEMINAR", "PRACTICE", "OTHER"] as const satisfies readonly AcademicSpaceType[];
