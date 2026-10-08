import { z } from "zod";

import { optionalUuid } from "@features/academic/schemas/academic-form-fields.schema";
import { ACADEMIC_SPACE_FORMAT } from "@features/academic/types/academic-space-format.types";
import { COURSE_WEEK_DAY } from "@features/academic/types/course-week-day.types";

export const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const timeField = z.string().regex(timePattern, "Ingresá una hora válida (HH:mm).");

export const scheduleSchema = z.object({ startTime: timeField, endTime: timeField });

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

export const courseClassDaySchema = z
  .object({
    dayOfWeek: z.enum(COURSE_WEEK_DAY),
    capacity: z.number().int().positive("El cupo debe ser mayor a 0.").nullable(),
    periodDurationMinutes: z.number().int().positive("La duración del período debe ser mayor a 0.").nullable(),
    schedules: z.array(scheduleSchema).min(1, "Agregá al menos un horario para el día."),
  })
  .superRefine((day, context) => {
    let hasInvalidSchedule = false;

    day.schedules.forEach((schedule, index) => {
      const start = toMinutes(schedule.startTime);
      const end = toMinutes(schedule.endTime);

      if (start < 0 || end < 0 || start >= end) {
        context.addIssue({
          code: "custom",
          message: "El horario que se quiere asignar es inválido.",
          path: ["schedules", index],
        });
        hasInvalidSchedule = true;
      }
    });

    if (hasInvalidSchedule) {
      return;
    }

    const totalMinutes = day.schedules.reduce((total, schedule) => total + (toMinutes(schedule.endTime) - toMinutes(schedule.startTime)), 0);

    if (totalMinutes <= 0) {
      context.addIssue({
        code: "custom",
        message: "Los horarios deben tener una duración mayor a 0.",
        path: ["schedules"],
      });

      return;
    }

    const slots = day.schedules
      .map((schedule, index) => ({
        index,
        start: toMinutes(schedule.startTime),
        end: toMinutes(schedule.endTime),
      }))
      .sort((a, b) => a.start - b.start);

    for (let index = 1; index < slots.length; index += 1) {
      if (slots[index].start < slots[index - 1].end) {
        context.addIssue({
          code: "custom",
          message: "Los horarios del mismo día no pueden superponerse.",
          path: ["schedules", slots[index].index],
        });
        context.addIssue({
          code: "custom",
          message: "Los horarios del mismo día no pueden superponerse.",
          path: ["schedules", slots[index - 1].index],
        });
      }
    }
  });

export const courseClassSchema = z.object({
  teacherIds: z.array(z.uuid()).min(1, "Seleccioná al menos un docente."),
  days: z.array(courseClassDaySchema).min(1, "Seleccioná al menos un día con sus horarios."),
});

export const courseClassesSchema = z.array(courseClassSchema).min(1, "El curso debe tener al menos una clase.");

export const parsedCourseClasses = z
  .string()
  .transform((value, context) => {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      context.addIssue({ code: "custom", message: "Las clases del curso no son válidas." });

      return z.NEVER;
    }
  })
  .pipe(courseClassesSchema);

export const courseSchema = z
  .object({
    studyPlanSpaceId: optionalUuid,
    studyPlanId: optionalUuid,
    academicSpaceId: optionalUuid,
    instrumentId: optionalUuid,
    academicYearId: z.string().uuid("Seleccioná un ciclo lectivo."),
    format: z.enum(ACADEMIC_SPACE_FORMAT, {
      error: "Seleccioná un espacio académico para definir el formato del curso.",
    }),
    classes: parsedCourseClasses,
  })
  .superRefine((value, context) => {
    if (!value.studyPlanSpaceId && (!value.studyPlanId || !value.academicSpaceId)) {
      context.addIssue({
        code: "custom",
        message: "Seleccioná un espacio del plan de estudio.",
        path: ["studyPlanSpaceId"],
      });
    }

    if (value.format !== "INDIVIDUAL") {
      return;
    }

    value.classes.forEach((courseClass, classIndex) => {
      courseClass.days.forEach((day, dayIndex) => {
        if (!day.periodDurationMinutes) {
          context.addIssue({
            code: "custom",
            message: "Indicá la duración de cada período para los espacios individuales.",
            path: ["classes"],
          });

          return;
        }

        day.schedules.forEach((schedule, scheduleIndex) => {
          if (day.periodDurationMinutes == null) {
            return;
          }

          const duration = toMinutes(schedule.endTime) - toMinutes(schedule.startTime);

          if (duration % day.periodDurationMinutes !== 0) {
            context.addIssue({
              code: "custom",
              message: "La duración total de los horarios debe ser divisible por la duración del período.",
              path: ["classes", classIndex, "days", dayIndex, "schedules", scheduleIndex],
            });
          }
        });
      });
    });
  });
