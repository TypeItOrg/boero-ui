import { z } from "zod";

export const documentAssignmentSchema = z.object({
  trainingPathId: z.uuid(),
  revision: z.number().int().min(0).optional(),
  level: z.enum(["AT_SUBMISSION", "BEFORE_CONFIRMATION", "OPTIONAL"]),
  displayOrder: z.number().int().min(0).max(2147483647),
  active: z.boolean(),
  specificInstructions: z.string().trim().max(1000).nullable(),
});
export const documentDefinitionSchema = z.object({
  name: z
    .string({ error: "Ingresá el nombre del documento." })
    .trim()
    .min(1, "Ingresá el nombre del documento.")
    .max(150, "El nombre no puede superar los 150 caracteres."),
  instructions: z
    .string({ error: "Revisá las instrucciones generales." })
    .trim()
    .max(1000, "Las instrucciones no pueden superar los 1000 caracteres."),
  allowedFormats: z
    .array(
      z.enum(["application/pdf", "image/jpeg", "image/png"], {
        error: "Seleccioná tipos de archivo válidos.",
      }),
      {
        error: "Seleccioná al menos un tipo de archivo.",
      },
    )
    .min(1, "Seleccioná al menos un tipo de archivo."),
  active: z.boolean({ error: "Seleccioná un estado válido." }),
  revision: z.number().int().min(0).optional(),
  assignments: z.array(documentAssignmentSchema),
});
