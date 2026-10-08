import { z } from "zod";

import { isValidDateRange, optionalDate } from "@features/academic/schemas/academic-form-fields.schema";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { ACADEMIC_YEAR_STATUS } from "@features/academic/types/academic-year-status.types";
import { COURSE_STATUS } from "@features/academic/types/course-status.types";
import { STUDY_PLAN_STATUS } from "@features/academic/types/study-plan-status.types";

export const academicStatusSchema = z.discriminatedUnion("resource", [
  z.object({
    resource: z.literal(AcademicResource.ACADEMIC_YEAR),
    status: z.enum(ACADEMIC_YEAR_STATUS),
  }),
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

      if (isValidDateRange(value.effectiveFrom, value.effectiveTo)) {
        return;
      }

      context.addIssue({
        code: "custom",
        message: "La fecha final no puede ser anterior al inicio del plan.",
        path: ["effectiveTo"],
      });
    }),
  z.object({
    resource: z.enum([AcademicResource.TRAINING_PATH, AcademicResource.ACADEMIC_SPACE, AcademicResource.INSTRUMENT, AcademicResource.SHIFT]),
    active: z.enum(["true", "false"]).transform((value) => value === "true"),
  }),
  z.object({
    resource: z.literal(AcademicResource.COURSE),
    status: z.enum(COURSE_STATUS),
  }),
]);
