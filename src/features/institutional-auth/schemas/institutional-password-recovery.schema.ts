import { z } from "zod";

import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";

export const institutionalPasswordRecoverySchema = z.object({
  institutionId: z.string().min(1, INSTITUTIONAL_AUTH_ERROR_MESSAGES.REQUIRED_INSTITUTION),
  documentNumber: z
    .string()
    .min(1, { message: INSTITUTIONAL_AUTH_ERROR_MESSAGES.REQUIRED_DOCUMENT, abort: true })
    .regex(/^\d{8}$/, INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_DOCUMENT),
});


