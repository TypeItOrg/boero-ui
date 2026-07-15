import { z } from "zod";

import { SYSTEM_ROLE_CODES } from "../types/person-role.types";
import { hasApplicantRoleConflict } from "../utils/person-role-rules.util";

export const personRoleSchema = z.object({
  role: z.enum(SYSTEM_ROLE_CODES, "Seleccioná un rol válido."),
});

export const personRoleCodesSchema = z
  .array(z.enum(SYSTEM_ROLE_CODES))
  .min(1, "El usuario debe tener al menos un rol.")
  .refine((roles) => new Set(roles).size === roles.length, "No se pueden repetir roles.")
  .refine((roles) => !hasApplicantRoleConflict(roles), "El rol Postulante no puede combinarse con otros roles.");
