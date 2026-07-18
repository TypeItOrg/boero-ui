import { z } from "zod";
import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import { hasMinimumPersonAge } from "@features/people/utils/person-birth-date.util";

export const institutionalRegisterSchema = z
  .object({
    institutionId: z.string().min(1, INSTITUTIONAL_AUTH_ERROR_MESSAGES.REQUIRED_INSTITUTION),
    name: z
      .string()
      .trim()
      .min(1, { message: INSTITUTIONAL_AUTH_ERROR_MESSAGES.REQUIRED_NAME, abort: true })
      .min(3, INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_NAME)
      .max(255, INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_NAME)
      .regex(/^[\p{L} ]+$/u, INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_NAME),
    lastName: z
      .string()
      .trim()
      .min(1, { message: INSTITUTIONAL_AUTH_ERROR_MESSAGES.REQUIRED_LAST_NAME, abort: true })
      .min(3, INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_LAST_NAME)
      .max(255, INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_LAST_NAME)
      .regex(/^[\p{L} ]+$/u, INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_LAST_NAME),
    birthDate: z
      .string()
      .min(1, { message: INSTITUTIONAL_AUTH_ERROR_MESSAGES.REQUIRED_BIRTH_DATE, abort: true })
      .refine(hasMinimumPersonAge, INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_BIRTH_DATE),
    documentNumber: z
      .string()
      .min(1, { message: INSTITUTIONAL_AUTH_ERROR_MESSAGES.REQUIRED_DOCUMENT, abort: true })
      .regex(/^\d{8}$/, INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_DOCUMENT),
    password: z
      .string()
      .min(1, { message: INSTITUTIONAL_AUTH_ERROR_MESSAGES.REQUIRED_PASSWORD, abort: true })
      .min(8, INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_PASSWORD)
      .max(255, INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_PASSWORD),
    confirmPassword: z.string().min(1, INSTITUTIONAL_AUTH_ERROR_MESSAGES.REQUIRED_PASSWORD),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_PASSWORD_CONFIRMATION,
    path: ["confirmPassword"],
  });
