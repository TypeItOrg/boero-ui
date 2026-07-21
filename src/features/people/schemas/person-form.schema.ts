import { z } from "zod";

import { hasMinimumPersonAge } from "@features/people/utils/person-birth-date.util";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";

const optionalEmail = z
  .string()
  .catch("")
  .refine((value) => !value || z.string().email().safeParse(value).success, PEOPLE_ERROR_MESSAGES.INVALID_EMAIL);

const optionalPhone = z.string().regex(/^[\d-]*$/, PEOPLE_ERROR_MESSAGES.INVALID_PHONE);

const basePersonSchema = z.object({
  firstName: z.string().min(3, PEOPLE_ERROR_MESSAGES.FIRST_NAME_MIN_LENGTH),
  lastName: z.string().min(3, PEOPLE_ERROR_MESSAGES.LAST_NAME_MIN_LENGTH),
  email: optionalEmail,
  phoneNumber: optionalPhone,
});

export const createPersonFormSchema = basePersonSchema.extend({
  documentNumber: z.string().regex(/^\d{8}$/, PEOPLE_ERROR_MESSAGES.INVALID_DOCUMENT),
  birthDate: z
    .string()
    .min(1, { message: PEOPLE_ERROR_MESSAGES.REQUIRED_BIRTH_DATE, abort: true })
    .refine(hasMinimumPersonAge, PEOPLE_ERROR_MESSAGES.MINIMUM_AGE),
  password: z.string().min(8, PEOPLE_ERROR_MESSAGES.PASSWORD_MIN_LENGTH),
});

export const updatePersonFormSchema = basePersonSchema;

export type CreatePersonFormInput = z.input<typeof createPersonFormSchema>;
export type CreatePersonFormValues = z.output<typeof createPersonFormSchema>;
export type UpdatePersonFormInput = z.input<typeof updatePersonFormSchema>;
export type UpdatePersonFormValues = z.output<typeof updatePersonFormSchema>;
