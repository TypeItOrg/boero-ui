import { z } from "zod";

import { PEOPLE_ERROR_MESSAGES } from "../constants/error-messages.constants";

export const personRoleSchema = z.object({
  role: z.string().uuid(PEOPLE_ERROR_MESSAGES.INVALID_ROLE),
});

export const personRoleIdsSchema = z
  .array(z.string().uuid(PEOPLE_ERROR_MESSAGES.INVALID_ROLE))
  .min(1, PEOPLE_ERROR_MESSAGES.MINIMUM_ROLE)
  .refine((roles) => new Set(roles).size === roles.length, PEOPLE_ERROR_MESSAGES.DUPLICATE_ROLE);
