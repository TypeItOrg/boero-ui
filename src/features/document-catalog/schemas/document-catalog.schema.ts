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
  name: z.string().trim().min(1).max(150),
  instructions: z.string().trim().max(1000),
  allowedFormats: z.array(z.enum(["application/pdf", "image/jpeg", "image/png"])).min(1),
  active: z.boolean(),
  revision: z.number().int().min(0).optional(),
  assignments: z.array(documentAssignmentSchema),
});
