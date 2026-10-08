import type { EnrollmentEducationLevel } from "@features/enrollment-applications/types/enrollment-academic-background.types";

export type SchoolingFormAction =
  | { type: "attendanceChanged"; value: boolean }
  | { type: "educationLevelChanged"; value: EnrollmentEducationLevel }
  | { type: "schoolOriginChanged"; value: string }
  | { type: "currentGradeYearChanged"; value: string }
  | { type: "levelCompletedChanged"; value: boolean }
  | { type: "secondaryCompletedChanged"; value: boolean }
  | { type: "secondaryDegreeTitleChanged"; value: string };
