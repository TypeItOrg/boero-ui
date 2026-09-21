import type { AcademicEnrollmentStatus } from "@features/course-enrollments/types/academic-enrollment-status.types";
import type { CourseEnrollmentStatus } from "@features/course-enrollments/types/course-enrollment-status.types";

export const ACADEMIC_ENROLLMENT_STATUS_LABELS: Record<AcademicEnrollmentStatus, string> = {
  IN_PROGRESS: "En curso",
  PENDING_RESULT: "Pendiente de resultado",
  REGULARIZED: "Regularizado",
  PROMOTED: "Promocionado",
  PASSED: "Aprobado",
  FAILED: "Desaprobado",
  NOT_APPLICABLE: "Sin efecto",
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

export const ACADEMIC_ENROLLMENT_STATUS_OPTIONS = (Object.keys(ACADEMIC_ENROLLMENT_STATUS_LABELS) as AcademicEnrollmentStatus[])
  .filter((status) => status !== "NOT_APPLICABLE")
  .map((status) => ({
    value: status,
    label: ACADEMIC_ENROLLMENT_STATUS_LABELS[status],
  }));

export const COURSE_ENROLLMENT_OPTIONS_TIMEOUT_MS = 15_000;

export const COURSE_ENROLLMENT_MESSAGES = {
  MUTATION_UNAVAILABLE:
    "No se pudo confirmar la operación. Tus datos siguen en el formulario. Comprobá el estado de la cursada y volvé a intentarlo cuando se restablezca la conexión.",
  ASSIGNMENTS_FAILED: "No se pudieron obtener los horarios disponibles. Intentá nuevamente.",
  ASSIGNMENTS_TIMEOUT: "La consulta de horarios tardó demasiado. Intentá nuevamente.",
  LOADING_ASSIGNMENTS: "Cargando clases y horarios…",
  INVALID_ASSIGNMENT: "La solicitud no es válida.",
  DAY_REQUIRED: "Seleccioná al menos un día de la clase para la cursada.",
  INVALID_SCHEDULE: "El horario o período no pertenece a la clase y día seleccionados.",
  NO_CAPACITY: "El horario seleccionado ya no tiene cupos disponibles. Actualizá las opciones.",
  COURSE_WITHOUT_CAPACITY: "Este curso no tiene cupos disponibles. La solicitud seguirá pendiente o en lista de espera hasta que se libere un lugar.",
  DUPLICATE_DAY: "Seleccioná una sola asignación por día.",
  SCHEDULE_REQUIRED: (day: string) => `Completá el horario del ${day}.`,
  PERIOD_REQUIRED: (day: string) => `Completá el período del ${day}.`,
  CATALOG_FAILED: "No se pudo cargar el catálogo.",
} as const;

export const WAITLIST_REASON_LABELS: Record<string, string> = {
  NO_CAPACITY_AT_PARENT_APPROVAL: "Sin cupo al aprobar la solicitud",
  CAPACITY_EXHAUSTED_AFTER_APPROVAL: "Cupos agotados después de la aprobación",
};

export const COURSE_DAY_LABELS: Record<string, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

export const COURSE_ENROLLMENT_OPERATION_LABELS: Record<string, string> = {
  APPLICATION_ENROLLMENT: "Inscripción desde solicitud",
  MANUAL_ENROLLMENT: "Alta manual",
  ACADEMIC_STATUS_UPDATE: "Actualización del resultado académico",
  COURSE_FINISHED: "Finalización del curso",
  WITHDRAWN: "Baja voluntaria",
  ADMINISTRATIVELY_WITHDRAWN: "Baja administrativa",
};
