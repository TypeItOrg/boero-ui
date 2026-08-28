import { z } from "zod";

import { parseDateInput } from "@common/utils/date-input.util";
import { ACADEMIC_SPACE_FORMAT } from "@features/academic/types/academic-space-format.types";
import { ACADEMIC_SPACE_TYPE } from "@features/academic/types/academic-space-type.types";
import { COURSE_WEEK_DAY } from "@features/academic/types/course-week-day.types";
import { ACADEMIC_YEAR_STATUS } from "@features/academic/types/academic-year-status.types";
import { APPROVAL_MODE } from "@features/academic/types/approval-mode.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { COURSE_STATUS } from "@features/academic/types/course-status.types";
import { REQUIRED_CONDITION } from "@features/academic/types/required-condition.types";
import { REQUIREMENT_STAGE } from "@features/academic/types/requirement-stage.types";
import { REQUIREMENT_TYPE } from "@features/academic/types/requirement-type.types";
import { STUDY_PLAN_STATUS } from "@features/academic/types/study-plan-status.types";
import {
  getMaxAcademicYear,
  isAcademicYearEndDate,
  isAcademicYearInRange,
  isAcademicYearStartDate,
  MIN_ACADEMIC_YEAR,
} from "@features/academic/utils/academic-year.util";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null);
const optionalDate = z
  .string()
  .refine((value) => !value || parseDateInput(value) !== undefined, "Ingresá una fecha válida.")
  .transform((value) => value || null);
const name = z.string().trim().min(1, "Ingresá un nombre.").max(150, "El nombre no puede superar los 150 caracteres.");
const positiveOrder = z.coerce.number().int().min(1, "El orden debe ser positivo.");

const studyPlanValiditySchema = z
  .object({ effectiveFrom: optionalDate, effectiveTo: optionalDate })
  .refine((value) => !value.effectiveTo || Boolean(value.effectiveFrom), {
    message: "Completá la fecha de inicio antes de indicar una fecha final.",
    path: ["effectiveFrom"],
  })
  .refine((value) => isValidDateRange(value.effectiveFrom, value.effectiveTo), {
    message: "La fecha final no puede ser anterior a la inicial.",
    path: ["effectiveTo"],
  });

const activeSchema = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .optional()
  .transform((val) => (val === undefined ? undefined : val === true || val === "true"));

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const timeField = z.string().regex(timePattern, "Ingresá una hora válida (HH:mm).");
const scheduleSchema = z.object({ startTime: timeField, endTime: timeField });

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

const courseClassDaySchema = z
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
    if (hasInvalidSchedule) return;
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
      if (slots[index].start <= slots[index - 1].end) {
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

const courseClassSchema = z.object({
  teacherIds: z.array(z.uuid()).min(1, "Seleccioná al menos un docente."),
  days: z.array(courseClassDaySchema).min(1, "Seleccioná al menos un día con sus horarios."),
});

const courseClassesSchema = z.array(courseClassSchema).min(1, "El curso debe tener al menos una clase.");

const parsedCourseClasses = z
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

const courseSchema = z
  .object({
    studyPlanId: z.string().uuid("Seleccioná un plan de estudio."),
    academicSpaceId: z.string().uuid("Seleccioná un espacio académico."),
    academicYearId: z.string().uuid("Seleccioná un ciclo lectivo."),
    format: z.enum(ACADEMIC_SPACE_FORMAT),
    classes: parsedCourseClasses,
  })
  .superRefine((value, context) => {
    if (value.format !== "INDIVIDUAL") return;
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
          if (day.periodDurationMinutes == null) return;
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

const namedResourceSchema = z.object({ name, description: optionalText(1000), active: activeSchema });
const academicFormSchemas: Record<AcademicResource, z.ZodType> = {
  [AcademicResource.ACADEMIC_YEAR]: z
    .object({
      year: z.coerce
        .number()
        .int()
        .refine((year) => isAcademicYearInRange(year), {
          message: `El año debe estar entre ${MIN_ACADEMIC_YEAR} y ${getMaxAcademicYear()}.`,
        }),
      startDate: optionalDate,
      endDate: optionalDate,
      status: z.enum(ACADEMIC_YEAR_STATUS).optional(),
    })
    .refine((value) => Boolean(value.startDate) === Boolean(value.endDate), {
      message: "Completá ambas fechas o dejá ambas vacías.",
      path: ["endDate"],
    })
    .refine((value) => isValidDateRange(value.startDate, value.endDate), {
      message: "La fecha final no puede ser anterior a la inicial.",
      path: ["endDate"],
    })
    .refine((value) => isAcademicYearStartDate(value.year, value.startDate), {
      message: "La fecha de inicio debe pertenecer al año del ciclo lectivo.",
      path: ["startDate"],
    })
    .refine((value) => isAcademicYearEndDate(value.year, value.endDate), {
      message: "La fecha de finalización debe pertenecer al año del ciclo lectivo o al siguiente.",
      path: ["endDate"],
    })
    .refine((value) => value.status !== "ACTIVE" || (Boolean(value.startDate) && Boolean(value.endDate)), {
      message: "Completá las fechas de inicio y finalización para activar el ciclo lectivo.",
      path: ["status"],
    }),
  [AcademicResource.TRAINING_PATH]: namedResourceSchema,
  [AcademicResource.INSTRUMENT]: namedResourceSchema,
  [AcademicResource.STUDY_PLAN]: z
    .object({ name, trainingPathId: z.string().uuid("Seleccioná un trayecto formativo.") })
    .and(studyPlanValiditySchema),
  [AcademicResource.ACADEMIC_LEVEL]: z.object({
    name,
    displayOrder: positiveOrder,
    description: optionalText(1000),
  }),
  [AcademicResource.ACADEMIC_SPACE]: z.object({
    name,
    description: optionalText(1000),
    type: z.enum(ACADEMIC_SPACE_TYPE),
    format: z.enum(ACADEMIC_SPACE_FORMAT),
    active: activeSchema,
  }),
  [AcademicResource.STUDY_PLAN_SPACE]: z.object({
    academicSpaceId: z.string().uuid("Seleccioná un espacio académico."),
    academicLevelId: z.string().transform((value) => (value === "unassigned" ? null : value)),
    requirementType: z.enum(REQUIREMENT_TYPE),
    displayOrder: positiveOrder,
    approvalMode: z.enum(APPROVAL_MODE),
  }),
  [AcademicResource.PREREQUISITE]: z.object({
    requiredStudyPlanSpaceId: z.string().uuid("Seleccioná un espacio requerido."),
    requirementStage: z.enum(REQUIREMENT_STAGE),
    requiredCondition: z.enum(REQUIRED_CONDITION),
  }),
  [AcademicResource.COURSE]: courseSchema,
};

export function parseAcademicForm(resource: AcademicResource, formData: FormData) {
  return academicFormSchemas[resource].safeParse(Object.fromEntries(formData.entries()));
}

export const academicStatusSchema = z.discriminatedUnion("resource", [
  z.object({ resource: z.literal(AcademicResource.ACADEMIC_YEAR), status: z.enum(ACADEMIC_YEAR_STATUS) }),
  z
    .object({
      resource: z.literal(AcademicResource.STUDY_PLAN),
      status: z.enum(STUDY_PLAN_STATUS),
      effectiveFrom: optionalDate.optional(),
      effectiveTo: optionalDate,
    })
    .superRefine((value, context) => {
      if (value.status === "INACTIVE" && !value.effectiveTo) {
        context.addIssue({
          code: "custom",
          message: "Ingresá la fecha de finalización.",
          path: ["effectiveTo"],
        });
        return;
      }

      if (isValidDateRange(value.effectiveFrom, value.effectiveTo)) return;
      context.addIssue({
        code: "custom",
        message: "La fecha final no puede ser anterior al inicio del plan.",
        path: ["effectiveTo"],
      });
    }),
  z.object({
    resource: z.enum([AcademicResource.TRAINING_PATH, AcademicResource.ACADEMIC_SPACE, AcademicResource.INSTRUMENT]),
    active: z.enum(["true", "false"]).transform((value) => value === "true"),
  }),
  z.object({
    resource: z.literal(AcademicResource.COURSE),
    status: z.enum(COURSE_STATUS),
  }),
]);

function isValidDateRange(start: string | null | undefined, end: string | null | undefined): boolean {
  return !start || !end || end >= start;
}
