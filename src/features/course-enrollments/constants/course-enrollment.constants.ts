import type { AcademicEnrollmentStatus } from "@features/course-enrollments/types/academic-enrollment-status.types";
import type { CourseEnrollmentStatus } from "@features/course-enrollments/types/course-enrollment-status.types";

export const ACADEMIC_ENROLLMENT_STATUS_LABELS: Record<AcademicEnrollmentStatus, string> = {
  IN_PROGRESS: "En curso",
  PENDING_RESULT: "Pendiente de resultado",
  REGULARIZED: "Regularizado",
  PROMOTED: "Promocionado",
  PASSED: "Aprobado",
  FAILED: "Desaprobado",
};

export const COURSE_ENROLLMENT_STATUS_LABELS: Record<CourseEnrollmentStatus, string> = {
  ENROLLED: "En curso",
  COMPLETED: "Finalizada",
  WITHDRAWN: "Baja voluntaria",
  ADMINISTRATIVELY_WITHDRAWN: "Baja administrativa",
};

export const COURSE_ENROLLMENT_STATUS_OPTIONS = (Object.keys(COURSE_ENROLLMENT_STATUS_LABELS) as CourseEnrollmentStatus[]).map((status) => ({
  value: status,
  label: COURSE_ENROLLMENT_STATUS_LABELS[status],
}));

export const ACADEMIC_ENROLLMENT_STATUS_OPTIONS = (Object.keys(ACADEMIC_ENROLLMENT_STATUS_LABELS) as AcademicEnrollmentStatus[]).map((status) => ({
  value: status,
  label: ACADEMIC_ENROLLMENT_STATUS_LABELS[status],
}));
