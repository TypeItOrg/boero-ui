import { z } from "zod";
import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";

export const institutionalInstitutionFormSchema = z.object({
  name: z.string().trim().min(1, INSTITUTION_ERROR_MESSAGES.REQUIRED_NAME).max(255, INSTITUTION_ERROR_MESSAGES.NAME_MAX_LENGTH),
  cityId: z.uuid(INSTITUTION_ERROR_MESSAGES.REQUIRED_CITY),
  street: z.string(),
  number: z.string().max(50, INSTITUTION_ERROR_MESSAGES.NUMBER_MAX_LENGTH).regex(/^\d*$/, INSTITUTION_ERROR_MESSAGES.INVALID_NUMBER),
  neighborhood: z.string(),
  additionalInfo: z.string(),
  phoneNumber: z
    .string()
    .max(30, INSTITUTION_ERROR_MESSAGES.PHONE_MAX_LENGTH)
    .regex(/^[\d-]*$/, INSTITUTION_ERROR_MESSAGES.INVALID_PHONE),
  email: z
    .string()
    .max(150, INSTITUTION_ERROR_MESSAGES.EMAIL_MAX_LENGTH)
    .refine((v) => !v || z.string().email().safeParse(v).success, INSTITUTION_ERROR_MESSAGES.INVALID_EMAIL),
});

export type InstitutionalInstitutionFormInput = z.input<typeof institutionalInstitutionFormSchema>;
export type InstitutionalInstitutionFormValues = z.output<typeof institutionalInstitutionFormSchema>;
