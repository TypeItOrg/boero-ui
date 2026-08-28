export type CourseStatus = "ACTIVE" | "INACTIVE" | "CLOSED";

export const COURSE_STATUS = ["ACTIVE", "INACTIVE", "CLOSED"] as const satisfies readonly CourseStatus[];
