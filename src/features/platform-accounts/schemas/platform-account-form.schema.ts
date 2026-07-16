import { z } from "zod";
import { PLATFORM_ACCOUNT_ERROR_MESSAGES } from "@features/platform-accounts/constants/error-messages.constants";

const personNameSchema = z
  .string()
  .trim()
  .min(3, PLATFORM_ACCOUNT_ERROR_MESSAGES.NAME_MIN_LENGTH)
  .max(255, PLATFORM_ACCOUNT_ERROR_MESSAGES.NAME_MAX_LENGTH)
  .regex(/^[\p{L} ]+$/u, PLATFORM_ACCOUNT_ERROR_MESSAGES.INVALID_NAME);

const platformAccountIdentitySchema = z.object({
  name: personNameSchema,
  lastName: personNameSchema,
  email: z
    .string()
    .trim()
    .min(1, PLATFORM_ACCOUNT_ERROR_MESSAGES.REQUIRED_EMAIL)
    .max(150, PLATFORM_ACCOUNT_ERROR_MESSAGES.EMAIL_MAX_LENGTH)
    .email(PLATFORM_ACCOUNT_ERROR_MESSAGES.INVALID_EMAIL),
});

const passwordConfirmationSchema = {
  password: z.string().max(255, PLATFORM_ACCOUNT_ERROR_MESSAGES.PASSWORD_MAX_LENGTH),
  confirmPassword: z.string(),
};

export const platformAccountFormSchema = platformAccountIdentitySchema
  .extend({
    password: z
      .string()
      .min(8, PLATFORM_ACCOUNT_ERROR_MESSAGES.PASSWORD_MIN_LENGTH)
      .max(255, PLATFORM_ACCOUNT_ERROR_MESSAGES.PASSWORD_MAX_LENGTH),
    confirmPassword: z.string().min(1, PLATFORM_ACCOUNT_ERROR_MESSAGES.REQUIRED_PASSWORD_CONFIRMATION),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: PLATFORM_ACCOUNT_ERROR_MESSAGES.PASSWORD_MISMATCH,
    path: ["confirmPassword"],
  });

export const platformAccountUpdateFormSchema = platformAccountIdentitySchema
  .extend(passwordConfirmationSchema)
  .superRefine((values, context) => {
    if (values.password !== "" && values.password.length < 8) {
      context.addIssue({
        code: "custom",
        path: ["password"],
        message: PLATFORM_ACCOUNT_ERROR_MESSAGES.PASSWORD_MIN_LENGTH,
      });
    }

    if (values.password !== values.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: PLATFORM_ACCOUNT_ERROR_MESSAGES.PASSWORD_MISMATCH,
      });
    }
  });

export type PlatformAccountFormInput = z.input<typeof platformAccountFormSchema>;
export type PlatformAccountFormValues = z.output<typeof platformAccountFormSchema>;
