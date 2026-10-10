import { z } from "zod";

import {
  activeSchema,
  checkboxSchema,
  isValidDateRange,
  name,
  optionalDate,
  optionalText,
  positiveOrder,
} from "@features/academic/schemas/academic-form-fields.schema";
import { courseSchema } from "@features/academic/schemas/course-form.schema";
import { studyPlanValiditySchema, studyPlanVersionFormSchema } from "@features/academic/schemas/study-plan-validity.schema";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { ACADEMIC_SPACE_FORMAT } from "@features/academic/types/academic-space-format.types";
import { ACADEMIC_SPACE_TYPE } from "@features/academic/types/academic-space-type.types";
import { ACADEMIC_YEAR_STATUS } from "@features/academic/types/academic-year-status.types";
import { APPROVAL_MODE } from "@features/academic/types/approval-mode.types";
import { REQUIRED_CONDITION } from "@features/academic/types/required-condition.types";
import { REQUIREMENT_STAGE } from "@features/academic/types/requirement-stage.types";
import { REQUIREMENT_TYPE } from "@features/academic/types/requirement-type.types";
import {
  MIN_ACADEMIC_YEAR,
  getMaxAcademicYear,
  isAcademicYearEndDate,
  isAcademicYearInRange,
  isAcademicYearStartDate,
} from "@features/academic/utils/academic-year.util";

const namedResourceSchema = z.object({
  name,
  description: optionalText(1000),
  active: activeSchema,
});

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
  [AcademicResource.SHIFT]: namedResourceSchema,
  [AcademicResource.STUDY_PLAN]: z
    .object({
      name,
      trainingPathId: z.string().uuid("Seleccioná un trayecto formativo."),
      status: z.enum(["DRAFT", "ACTIVE"]).optional(),
    })
    .and(studyPlanValiditySchema)
    .refine((value) => value.status !== "ACTIVE" || Boolean(value.effectiveFrom), {
      message: "Completá la fecha de inicio para activar el plan.",
      path: ["effectiveFrom"],
    }),
  [AcademicResource.ACADEMIC_LEVEL]: z.object({
    displayOrder: positiveOrder,
    description: optionalText(1000),
  }),
  [AcademicResource.ACADEMIC_SPACE]: z.object({
    name,
    description: optionalText(1000),
    type: z.enum(ACADEMIC_SPACE_TYPE),
    format: z.enum(ACADEMIC_SPACE_FORMAT),
    instrumental: checkboxSchema,
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
  const values = Object.fromEntries(formData.entries());

  return academicFormSchemas[resource].safeParse(values);
}

export function parseStudyPlanVersionForm(formData: FormData) {
  return studyPlanVersionFormSchema.safeParse(Object.fromEntries(formData.entries()));
}

export { studyPlanVersionFormSchema } from "@features/academic/schemas/study-plan-validity.schema";

export { academicStatusSchema } from "@features/academic/schemas/academic-status.schema";
