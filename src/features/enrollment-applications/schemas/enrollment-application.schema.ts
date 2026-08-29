import { z } from "zod";

export const startEnrollmentApplicationSchema = z.object({
  studyPlanId: z.string().uuid("El plan de estudio debe ser un UUID válido"),
  academicYearId: z.string().uuid("El ciclo lectivo debe ser un UUID válido"),
});

export const updateEnrollmentDraftSchema = z.object({
  data: z.record(z.string(), z.unknown()),
});
