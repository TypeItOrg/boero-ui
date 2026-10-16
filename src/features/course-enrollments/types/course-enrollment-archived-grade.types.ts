import type { CourseEnrollmentGradeHistoryAction } from "@features/course-enrollments/types/course-enrollment-grade-history-action.types";

export type CourseEnrollmentArchivedGrade = {
  gradeId: string;
  lastEvaluation: string;
  lastValue?: number | null;
  deletedAt: string;
  deletionType: CourseEnrollmentGradeHistoryAction;
};
