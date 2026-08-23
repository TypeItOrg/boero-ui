import { z } from "zod";

import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";

export const resetInstitutionalPasswordSchema = z
  .object({
    token: z.string().min(1, INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSWORD_RECOVERY_INVALID_TOKEN),
    password: z.string().min(8, INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_PASSWORD).max(255),
    confirmPassword: z.string().min(1, INSTITUTIONAL_AUTH_ERROR_MESSAGES.REQUIRED_PASSWORD),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_PASSWORD_CONFIRMATION,
    path: ["confirmPassword"],
  });
