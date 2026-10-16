import type { CourseEnrollmentGradeHistoryAction } from "@features/course-enrollments/types/course-enrollment-grade-history-action.types";

export type CourseEnrollmentGradeHistoryEvent = {
  historyId: string;
  gradeId: string;
  operation: CourseEnrollmentGradeHistoryAction;
  evaluationBefore?: string | null;
  valueBefore?: number | null;
  evaluationAfter?: string | null;
  valueAfter?: number | null;
  publishedEvaluationBefore?: string | null;
  publishedValueBefore?: number | null;
  publishedEvaluationAfter?: string | null;
  publishedValueAfter?: number | null;
  previousStatus?: string | null;
  newStatus?: string | null;
  actor?: { id: string; fullName: string } | null;
  changedAt: string;
};
