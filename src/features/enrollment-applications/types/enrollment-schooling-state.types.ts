import type { EnrollmentEducationLevel } from "@features/enrollment-applications/types/enrollment-academic-background.types";

export type SchoolingFormState = {
  currentlyStudying: boolean | null;
  educationLevel: EnrollmentEducationLevel | null;
  schoolOrigin: string;
  currentGradeYear: string;
  levelCompleted: boolean | null;
  secondaryCompleted: boolean | null;
  secondaryDegreeTitle: string;
};
