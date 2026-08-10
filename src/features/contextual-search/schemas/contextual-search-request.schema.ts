import { z } from "zod";

const searchTermSchema = z
  .string()
  .trim()
  .min(2)
  .max(100)
  .regex(/[\p{L}\p{N}]/u);

export const contextualSearchRequestSchema = z.object({
  search: searchTermSchema,
  limit: z.coerce.number().int().min(1).max(5).default(5),
});

export const institutionalContextualSearchRequestSchema = contextualSearchRequestSchema.extend({
  institutionId: z.uuid(),
});
