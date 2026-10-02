import { z } from "zod";

export const documentRequirementSchema = z.object({
  documentId: z.uuid(),
  revision: z.number().int().min(0).optional(),
  specificInstructions: z.string().trim().max(1000).nullable().optional(),
  name: z.string().trim().min(1).max(150),
  instructions: z.string().trim().max(1000),
  level: z.enum(["AT_SUBMISSION", "BEFORE_CONFIRMATION", "OPTIONAL"]),
  allowedFormats: z.array(z.enum(["application/pdf", "image/jpeg", "image/png"])).min(1),
  displayOrder: z.number().int().min(0).max(2147483647),
  active: z.boolean(),
});

export const documentRequirementFormSchema = documentRequirementSchema.extend({
  displayOrder: z.string().regex(/^\d+$/).transform(Number).pipe(documentRequirementSchema.shape.displayOrder),
  active: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export function parseDocumentRequirementForm(form: FormData) {
  return documentRequirementFormSchema.safeParse({
    documentId: form.get("documentId"),
    revision: form.get("revision") ? Number(form.get("revision")) : undefined,
    specificInstructions: form.get("specificInstructions"),
    name: form.get("name"),
    instructions: form.get("instructions"),
    level: form.get("level"),
    allowedFormats: form.getAll("allowedFormats"),
    displayOrder: form.get("displayOrder"),
    active: form.get("active"),
  });
}
