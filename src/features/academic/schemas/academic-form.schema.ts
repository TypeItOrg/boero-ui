import { z } from "zod";

import { parseDateInput } from "@common/utils/date-input.util";
import { ACADEMIC_SPACE_TYPE } from "@features/academic/types/academic-space-type.types";
import { ACADEMIC_YEAR_STATUS } from "@features/academic/types/academic-year-status.types";
import { APPROVAL_MODE } from "@features/academic/types/approval-mode.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
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
    active: z.boolean(),
  }),
]);

function isValidDateRange(start: string | null | undefined, end: string | null | undefined): boolean {
  return !start || !end || end >= start;
}
