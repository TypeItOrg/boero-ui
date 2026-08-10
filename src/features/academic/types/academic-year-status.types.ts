export type AcademicYearStatus = "PLANNED" | "ACTIVE" | "CLOSED";

export const ACADEMIC_YEAR_STATUS = ["PLANNED", "ACTIVE", "CLOSED"] as const satisfies readonly AcademicYearStatus[];
