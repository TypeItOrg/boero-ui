import type { AcademicEnrollmentStatus } from "@features/course-enrollments/types/academic-enrollment-status.types";

export const ACADEMIC_ENROLLMENT_STATUS_LABELS: Record<AcademicEnrollmentStatus, string> = {
  IN_PROGRESS: "En curso",
  PENDING_RESULT: "Pendiente de resultado",
  REGULARIZED: "Regularizado",
  PROMOTED: "Promocionado",
  PASSED: "Aprobado",
  FAILED: "Desaprobado",
};
