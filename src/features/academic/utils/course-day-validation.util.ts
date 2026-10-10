import type { DayDraft } from "@features/academic/types/course-day-draft.types";
import { toMinutes } from "@features/academic/utils/course-form-draft.util";

export function getCoursePeriodError(day: DayDraft, individual: boolean, hasSubmitted: boolean): string | undefined {
  if (!hasSubmitted || !individual) {
    return undefined;
  }

  if (!day.periodDurationMinutes) {
    return "Indicá la duración de cada período para los espacios individuales.";
  }

  if (Number(day.periodDurationMinutes) <= 0) {
    return "La duración del período debe ser mayor a 0.";
  }

  return undefined;
}

export function getCourseScheduleError(day: DayDraft, individual: boolean, hasSubmitted: boolean, scheduleIndex: number): string | undefined {
  if (!hasSubmitted) {
    return undefined;
  }

  const schedule = day.schedules[scheduleIndex];

  if (!schedule.startTime || !schedule.endTime) {
    return "Completá todos los horarios.";
  }

  const start = toMinutes(schedule.startTime);

  const end = toMinutes(schedule.endTime);

  if (start < 0 || end < 0 || start >= end) {
    return "El horario que se quiere asignar es inválido.";
  }

  // Only check overlap/divisibility if every schedule in this day is individually valid
  const allValid = day.schedules.every((candidate) => {
    if (!candidate.startTime || !candidate.endTime) {
      return false;
    }

    const candidateStart = toMinutes(candidate.startTime);

    const candidateEnd = toMinutes(candidate.endTime);

    return candidateStart >= 0 && candidateEnd >= 0 && candidateStart < candidateEnd;
  });

  if (!allValid) {
    return undefined;
  }

  const slots = day.schedules.map((candidate, candidateIndex) => ({
    index: candidateIndex,
    start: toMinutes(candidate.startTime),
    end: toMinutes(candidate.endTime),
  }));

  for (let otherIndex = 0; otherIndex < slots.length; otherIndex += 1) {
    if (otherIndex === scheduleIndex) {
      continue;
    }

    const other = slots[otherIndex];

    if (start < other.end && other.start < end) {
      return "Los horarios del mismo día no pueden superponerse.";
    }
  }

  if (individual && day.periodDurationMinutes) {
    const period = Number(day.periodDurationMinutes);

    if (period > 0) {
      const duration = end - start;

      if (duration % period !== 0) {
        return "La duración total de los horarios debe ser divisible por la duración del período.";
      }
    }
  }

  return undefined;
}

export function getCourseDayError(day: DayDraft, hasSubmitted: boolean, getScheduleError: (index: number) => string | undefined): string | undefined {
  if (!hasSubmitted) {
    return undefined;
  }

  const validSchedules = day.schedules.filter((schedule) => {
    if (!schedule.startTime || !schedule.endTime) {
      return false;
    }

    const start = toMinutes(schedule.startTime);

    const end = toMinutes(schedule.endTime);

    return start >= 0 && end >= 0 && start < end;
  });

  if (validSchedules.length === 0) {
    return undefined;
  }

  const hasInvalidSchedules = day.schedules.some((_, index) => Boolean(getScheduleError(index)));

  if (hasInvalidSchedules) {
    return undefined;
  }

  const computedTotal = validSchedules.reduce((total, schedule) => total + (toMinutes(schedule.endTime) - toMinutes(schedule.startTime)), 0);

  if (computedTotal <= 0) {
    return "Los horarios deben tener una duración mayor a 0.";
  }

  return undefined;
}
