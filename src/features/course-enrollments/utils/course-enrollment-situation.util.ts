import {
  ACADEMIC_ENROLLMENT_STATUS_LABELS,
  COURSE_ENROLLMENT_STATUS_LABELS,
} from "@features/course-enrollments/constants/course-enrollment.constants";
import type { AcademicEnrollmentStatus } from "@features/course-enrollments/types/academic-enrollment-status.types";
import type { CourseEnrollmentStatus } from "@features/course-enrollments/types/course-enrollment-status.types";

export function getCourseEnrollmentSituationLabel(status: CourseEnrollmentStatus, academicStatus: AcademicEnrollmentStatus): string {
  if (status === "WITHDRAWN" || status === "ADMINISTRATIVELY_WITHDRAWN") {
    return COURSE_ENROLLMENT_STATUS_LABELS[status];
  }

  if (status === "COMPLETED") {
    return ACADEMIC_ENROLLMENT_STATUS_LABELS[academicStatus];
  }

  return COURSE_ENROLLMENT_STATUS_LABELS[status];
}
