import { z } from "zod";

import { SYSTEM_ROLE_CODES } from "../types/person-role.types";
import { hasApplicantRoleConflict } from "../utils/person-role-rules.util";
import { PEOPLE_ERROR_MESSAGES } from "../constants/error-messages.constants";

export const personRoleSchema = z.object({
  role: z.enum(SYSTEM_ROLE_CODES, PEOPLE_ERROR_MESSAGES.INVALID_ROLE),
});

export const personRoleCodesSchema = z
  .array(z.enum(SYSTEM_ROLE_CODES))
  .min(1, PEOPLE_ERROR_MESSAGES.MINIMUM_ROLE)
  .refine((roles) => new Set(roles).size === roles.length, PEOPLE_ERROR_MESSAGES.DUPLICATE_ROLE)
  .refine((roles) => !hasApplicantRoleConflict(roles), PEOPLE_ERROR_MESSAGES.APPLICANT_ROLE_CONFLICT);
