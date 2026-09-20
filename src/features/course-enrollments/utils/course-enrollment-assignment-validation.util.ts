import { COURSE_DAY_LABELS, COURSE_ENROLLMENT_MESSAGES as MESSAGES } from "@features/course-enrollments/constants/course-enrollment.constants";
import { isValidUuid } from "@common/utils/action-argument.util";
import type { CourseEnrollmentAssignmentOptions } from "@features/course-enrollments/types/course-enrollment-assignment-options.types";

export type EnrollmentAssignmentValidation = {
  ok: boolean;
  message?: string;
  invalidDayIds?: string[];
};

type SubmittedAssignment = {
  dayId?: unknown;
  classScheduleId: unknown;
  individualSlotId: unknown;
};

function dayLabel(dayOfWeek: string): string {
  return COURSE_DAY_LABELS[dayOfWeek]?.toLowerCase() ?? dayOfWeek;
}

function parseAssignments(value: FormDataEntryValue | null): SubmittedAssignment[] | null {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed) || parsed.some((item) => item === null || typeof item !== "object" || Array.isArray(item))) {
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
    return { ok: false, message: MESSAGES.INVALID_ASSIGNMENT };
  }

  if (assignments.length === 0) {
    return { ok: false, message: MESSAGES.DAY_REQUIRED, invalidDayIds: [] };
  }

  const selectedClass = options.classes.find((courseClass) => courseClass.id === courseClassId);
  if (!selectedClass) {
    return { ok: false, message: MESSAGES.INVALID_SCHEDULE };
  }
  const seenDays = new Set<string>();
  const messages: string[] = [];
  const invalidDayIds: string[] = [];

  for (const assignment of assignments) {
    const day = assignment.dayId
      ? selectedClass.days.find((candidate) => candidate.id === assignment.dayId)
      : selectedClass.days.find((candidate) => candidate.schedules.some((schedule) => schedule.id === assignment.classScheduleId));
    const label = day ? dayLabel(day.dayOfWeek) : "el día";

    if (typeof assignment.classScheduleId !== "string" || !isValidUuid(assignment.classScheduleId)) {
      messages.push(MESSAGES.SCHEDULE_REQUIRED(label));

      if (day) {
        invalidDayIds.push(day.id);
      }

      continue;
    }

    const schedule = day?.schedules.find((value) => value.id === assignment.classScheduleId);
    if (!day || !schedule) {
      messages.push(MESSAGES.INVALID_SCHEDULE);
      continue;
    }
    if (seenDays.has(day.id)) {
      messages.push(MESSAGES.DUPLICATE_DAY);
      invalidDayIds.push(day.id);
    }
    seenDays.add(day.id);
    if (day.availableCapacity === 0) {
      messages.push(MESSAGES.NO_CAPACITY);
      invalidDayIds.push(day.id);
    }
    if (options.format === "GRUPAL" && assignment.individualSlotId !== null) {
      messages.push(MESSAGES.INVALID_SCHEDULE);
      invalidDayIds.push(day.id);
    }
    if (options.format === "INDIVIDUAL" && typeof assignment.individualSlotId === "string" && isValidUuid(assignment.individualSlotId)) {
      const slot = schedule.individualSlots.find((value) => value.id === assignment.individualSlotId);
      if (!slot || !slot.available) {
        messages.push(slot ? MESSAGES.NO_CAPACITY : MESSAGES.INVALID_SCHEDULE);
        invalidDayIds.push(day.id);
      }
    }

    if (options.format === "INDIVIDUAL" && (typeof assignment.individualSlotId !== "string" || !isValidUuid(assignment.individualSlotId))) {
      messages.push(MESSAGES.PERIOD_REQUIRED(label));

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
