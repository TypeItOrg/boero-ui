import { z } from "zod";

function parseGradeValue(raw: unknown): number | undefined {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }

  if (typeof raw !== "string") {
    return undefined;
  }

  const normalized = raw.trim().replace(",", ".");

  if (!normalized) {
    return undefined;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : undefined;
}

export const courseEnrollmentGradeSchema = z.object({
  evaluation: z
    .string()
    .trim()
    .min(1, "La evaluación es obligatoria.")
    .max(150, "La evaluación no debe superar los 150 caracteres."),
  value: z.preprocess(
    parseGradeValue,
    z
      .number("La nota es obligatoria.")
      .min(1, "La nota debe estar entre 1 y 10.")
      .max(10, "La nota debe estar entre 1 y 10.")
      .refine(
        (grade) => {
          const decimals = String(grade).split(".")[1];
          return !decimals || decimals.length <= 2;
        },
        { message: "La nota admite como máximo dos decimales." },
      ),
  ),
});

export type CourseEnrollmentGradeFormValues = z.infer<typeof courseEnrollmentGradeSchema>;
