import { isValidUuid } from "@common/utils/action-argument.util";
import type { CourseEnrollmentAssignmentOptions } from "@features/course-enrollments/types/course-enrollment-assignment-options.types";

export type EnrollmentAssignmentValidation = {
  ok: boolean;
  message?: string;
  invalidDayIds?: string[];
};

type SubmittedAssignment = {
  dayId?: string;
  classScheduleId: string;
  individualSlotId: string | null;
};

const DAY_LABELS: Record<string, string> = {
  MONDAY: "lunes",
  TUESDAY: "martes",
  WEDNESDAY: "miércoles",
  THURSDAY: "jueves",
  FRIDAY: "viernes",
  SATURDAY: "sábado",
  SUNDAY: "domingo",
};

function dayLabel(dayOfWeek: string): string {
  return DAY_LABELS[dayOfWeek] ?? dayOfWeek;
}

function parseAssignments(value: FormDataEntryValue | null): SubmittedAssignment[] | null {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed as SubmittedAssignment[];
  } catch {
    return null;
  }
}

export function validateEnrollmentAssignment(formData: FormData, options: CourseEnrollmentAssignmentOptions): EnrollmentAssignmentValidation {
  const courseClassId = formData.get("courseClassId");
  const assignments = parseAssignments(formData.get("assignments"));

  if (typeof courseClassId !== "string" || !isValidUuid(courseClassId) || !assignments) {
    return { ok: false, message: "La solicitud no es válida." };
  }

  if (assignments.length === 0) {
    return { ok: false, message: "Seleccioná al menos un día de la clase para la cursada.", invalidDayIds: [] };
  }

  const selectedClass = options.classes.find((courseClass) => courseClass.id === courseClassId);
  const messages: string[] = [];
  const invalidDayIds: string[] = [];

  for (const assignment of assignments) {
    const day =
      selectedClass?.days.find((candidate) => candidate.id === assignment.dayId) ??
      selectedClass?.days.find((candidate) => candidate.schedules.some((schedule) => schedule.id === assignment.classScheduleId));
    const label = day ? dayLabel(day.dayOfWeek) : "el día";

    if (typeof assignment.classScheduleId !== "string" || !isValidUuid(assignment.classScheduleId)) {
      messages.push(`Completá el horario del ${label}.`);

      if (day) {
        invalidDayIds.push(day.id);
      }

      continue;
    }

    if (options.format === "INDIVIDUAL" && (typeof assignment.individualSlotId !== "string" || !isValidUuid(assignment.individualSlotId))) {
      messages.push(`Completá el período del ${label}.`);

      if (day) {
        invalidDayIds.push(day.id);
      }
    }
  }

  if (messages.length > 0) {
    return { ok: false, message: messages.join(" "), invalidDayIds };
  }

  return { ok: true };
}
