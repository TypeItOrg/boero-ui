export type EnrollmentEducationLevel = "NO_SCHOOLING" | "INITIAL" | "PRIMARY" | "SECONDARY" | "NON_UNIVERSITY_HIGHER" | "UNIVERSITY";

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
