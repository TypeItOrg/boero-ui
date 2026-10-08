import { z } from "zod";

import { isValidDateRange, name, optionalDate } from "@features/academic/schemas/academic-form-fields.schema";

export const studyPlanValiditySchema = z
  .object({ effectiveFrom: optionalDate, effectiveTo: optionalDate })
  .refine((value) => !value.effectiveTo || Boolean(value.effectiveFrom), {
    message: "Completá la fecha de inicio antes de indicar una fecha final.",
    path: ["effectiveFrom"],
  })
  .refine((value) => isValidDateRange(value.effectiveFrom, value.effectiveTo), {
    message: "La fecha final no puede ser anterior a la inicial.",
    path: ["effectiveTo"],
  });

export const studyPlanVersionFormSchema = z
  .object({ name, effectiveFrom: optionalDate, effectiveTo: optionalDate })
  .refine((value) => Boolean(value.effectiveFrom), {
    message: "Definí la fecha de inicio de la nueva versión.",
    path: ["effectiveFrom"],
  })
  .refine((value) => isValidDateRange(value.effectiveFrom, value.effectiveTo), {
    message: "La fecha final no puede ser anterior a la inicial.",
    path: ["effectiveTo"],
  });
