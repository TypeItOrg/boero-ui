import { type EnrollmentEducationLevel } from "@features/enrollment-applications/types/enrollment-education-level.types";

export interface EnrollmentAcademicBackground {
  secondarySchool?: string | null;
  currentlyStudying?: boolean | null;
  educationLevel?: EnrollmentEducationLevel | null;
  schoolOrigin?: string | null;
  currentGradeYear?: string | null;
  levelCompleted?: boolean | null;
  secondaryCompleted?: boolean | null;
  secondaryDegreeTitle?: string | null;
}

export type { EnrollmentEducationLevel } from "@features/enrollment-applications/types/enrollment-education-level.types";
