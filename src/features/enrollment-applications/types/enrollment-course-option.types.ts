export interface EnrollmentCourseOption {
  courseId: string;
  studyPlanSpaceId: string;
  academicSpaceName: string;
  academicLevelName?: string | null;
  studyPlanName: string;
  trainingPathName: string;
  format: "INDIVIDUAL" | "GRUPAL";
  instrumentId?: string | null;
  instrumentName?: string | null;
  hasCapacity: boolean;
}
