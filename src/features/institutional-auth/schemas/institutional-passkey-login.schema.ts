import { z } from "zod";
import { institutionalIdentifySchema } from "@features/institutional-auth/schemas/institutional-identify.schema";
import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";

export const institutionalPasskeyLoginSchema = z.object({
  institutionId: institutionalIdentifySchema.shape.institutionId,
  documentNumber: z
    .string()
    .trim()
    .pipe(z.union([z.literal(""), institutionalIdentifySchema.shape.documentNumber], { error: INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_DOCUMENT })),
  institutionName: z.string().optional(),
});
