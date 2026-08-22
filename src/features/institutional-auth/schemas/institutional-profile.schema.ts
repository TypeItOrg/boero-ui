import { z } from "zod";

import { hasMinimumPersonAge } from "@features/people/utils/person-birth-date.util";

export const institutionalProfileSchema = z.object({
  firstName: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres."),
  lastName: z.string().trim().min(3, "El apellido debe tener al menos 3 caracteres."),
  birthDate: z.string().min(1, "La fecha de nacimiento es requerida.").refine(hasMinimumPersonAge, "La persona debe tener al menos 3 años."),
  email: z
    .string()
    .trim()
    .refine((value) => !value || z.email().safeParse(value).success, "Ingresá un email válido."),
  phoneNumber: z.string().regex(/^[\d-]*$/, "El teléfono solo admite números y guiones."),
  birthCityId: z.string().optional(),
  nationalityCountryId: z.string().optional(),
  address: z
    .object({
      cityId: z.string().min(1, "La ciudad es requerida."),
      street: z.string().trim().min(1, "La calle es requerida."),
      number: z.string().max(50).optional(),
      floor: z.string().max(50).optional(),
      apartment: z.string().max(50).optional(),
      neighborhood: z.string().optional(),
      additionalInfo: z.string().optional(),
    })
    .optional(),
});

export type InstitutionalProfileInput = z.infer<typeof institutionalProfileSchema>;
