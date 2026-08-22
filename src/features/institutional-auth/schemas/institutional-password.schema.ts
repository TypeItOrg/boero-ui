import { z } from "zod";

import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";

export const institutionalPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, PEOPLE_ERROR_MESSAGES.REQUIRED_CURRENT_PASSWORD).max(255, PEOPLE_ERROR_MESSAGES.PASSWORD_MAX_LENGTH),
    password: z.string().min(8, PEOPLE_ERROR_MESSAGES.PASSWORD_MIN_LENGTH).max(255, PEOPLE_ERROR_MESSAGES.PASSWORD_MAX_LENGTH),
    confirmPassword: z.string().min(1, PEOPLE_ERROR_MESSAGES.REQUIRED_PASSWORD_CONFIRMATION),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: PEOPLE_ERROR_MESSAGES.PASSWORD_MISMATCH,
  });
