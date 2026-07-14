import { z } from "zod";

import { SYSTEM_ROLE_CODES } from "../types/person-role.types";

export const personRoleSchema = z.object({
  role: z.enum(SYSTEM_ROLE_CODES, "Seleccioná un rol válido."),
});

export const personRoleCodesSchema = z
  .array(z.enum(SYSTEM_ROLE_CODES))
  .refine((roles) => new Set(roles).size === roles.length, "No se pueden repetir roles.");
