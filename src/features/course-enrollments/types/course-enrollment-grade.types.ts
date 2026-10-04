import type { CourseEnrollmentGradeStatus } from "@features/course-enrollments/types/course-enrollment-grade-status.types";

export interface CourseEnrollmentGrade {
  id: string;
  evaluation: string;
  value: number;
  publicationStatus: CourseEnrollmentGradeStatus;
  publishedEvaluation?: string | null;
  publishedValue?: number | null;
  createdBy?: { id: string; fullName: string } | null;
  createdAt: string;
  updatedBy?: { id: string; fullName: string } | null;
  updatedAt: string;
  publishedBy?: { id: string; fullName: string } | null;
  publishedAt?: string | null;
  version: number;
}
