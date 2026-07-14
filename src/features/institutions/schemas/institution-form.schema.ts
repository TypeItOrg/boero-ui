import { z } from "zod";

export const institutionFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido.").max(255, "El nombre admite hasta 255 caracteres."),
  slug: z
    .string()
    .min(1, "El slug es requerido.")
    .max(100, "El slug admite hasta 100 caracteres.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Solo letras minúsculas, números y guiones."),
  cityId: z.uuid("La ciudad es requerida."),
  street: z.string(),
  number: z.string().max(50, "La altura admite hasta 50 caracteres."),
  neighborhood: z.string(),
  additionalInfo: z.string(),
  phoneNumber: z.string().max(30, "El teléfono admite hasta 30 caracteres."),
  email: z
    .string()
    .max(150, "El email admite hasta 150 caracteres.")
    .refine((v) => !v || z.string().email().safeParse(v).success, "Ingresá un email válido."),
});

export type InstitutionFormInput = z.input<typeof institutionFormSchema>;
export type InstitutionFormValues = z.output<typeof institutionFormSchema>;
