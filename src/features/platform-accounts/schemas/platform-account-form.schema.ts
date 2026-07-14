import { z } from "zod";

const personNameSchema = z
  .string()
  .trim()
  .min(3, "Debe tener al menos 3 caracteres.")
  .max(255, "Admite hasta 255 caracteres.")
  .regex(/^[\p{L} ]+$/u, "Solo puede contener letras y espacios.");

const platformAccountIdentitySchema = z.object({
  name: personNameSchema,
  lastName: personNameSchema,
  email: z
    .string()
    .trim()
    .min(1, "El correo electrónico es requerido.")
    .max(150, "El correo electrónico admite hasta 150 caracteres.")
    .email("Ingresá un correo electrónico válido."),
});

const passwordConfirmationSchema = {
  password: z.string().max(255, "La contraseña admite hasta 255 caracteres."),
  confirmPassword: z.string(),
};

export const platformAccountFormSchema = platformAccountIdentitySchema
  .extend({
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .max(255, "La contraseña admite hasta 255 caracteres."),
    confirmPassword: z.string().min(1, "Confirmá la contraseña."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export const platformAccountUpdateFormSchema = platformAccountIdentitySchema
  .extend(passwordConfirmationSchema)
  .superRefine((values, context) => {
    if (values.password !== "" && values.password.length < 8) {
      context.addIssue({
        code: "custom",
        path: ["password"],
        message: "La contraseña debe tener al menos 8 caracteres.",
      });
    }

    if (values.password !== values.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Las contraseñas no coinciden.",
      });
    }
  });

export type PlatformAccountFormInput = z.input<typeof platformAccountFormSchema>;
export type PlatformAccountFormValues = z.output<typeof platformAccountFormSchema>;
