import type { AcademicEnrollmentStatus } from "@features/course-enrollments/types/academic-enrollment-status.types";
import type { CourseEnrollmentStatus } from "@features/course-enrollments/types/course-enrollment-status.types";

export interface CourseEnrollmentHistory {
  id: string;
  previousStatus: CourseEnrollmentStatus | null;
  newStatus: CourseEnrollmentStatus | null;
  previousAcademicStatus: AcademicEnrollmentStatus | null;
  newAcademicStatus: AcademicEnrollmentStatus | null;
  operation: string;
  reason: string | null;
  authorityPersonId: string | null;
  changedAt: string;
}
