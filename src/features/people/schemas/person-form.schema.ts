import { z } from "zod";

const optionalEmail = z
  .string()
  .catch("")
  .refine((value) => !value || z.string().email().safeParse(value).success, "Ingresá un email válido.");

const optionalPhone = z.string().catch("");

const basePersonSchema = z.object({
  firstName: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  lastName: z.string().min(3, "El apellido debe tener al menos 3 caracteres."),
  email: optionalEmail,
  phoneNumber: optionalPhone,
});

export const createPersonFormSchema = basePersonSchema.extend({
  documentNumber: z.string().regex(/^\d{8}$/, "El documento debe tener exactamente 8 dígitos."),
  birthDate: z.string().catch(""),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export const updatePersonFormSchema = basePersonSchema;

export type CreatePersonFormInput = z.input<typeof createPersonFormSchema>;
export type CreatePersonFormValues = z.output<typeof createPersonFormSchema>;
export type UpdatePersonFormInput = z.input<typeof updatePersonFormSchema>;
export type UpdatePersonFormValues = z.output<typeof updatePersonFormSchema>;
