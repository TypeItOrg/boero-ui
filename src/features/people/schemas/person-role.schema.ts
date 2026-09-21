import { z } from "zod";

import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";

export const personRoleIdsSchema = z
  .array(z.string().uuid(PEOPLE_ERROR_MESSAGES.INVALID_ROLE))
  .min(1, PEOPLE_ERROR_MESSAGES.MINIMUM_ROLE)
  .refine((roles) => new Set(roles).size === roles.length, PEOPLE_ERROR_MESSAGES.DUPLICATE_ROLE);

export const personRoleAssignmentsSchema = z
  .array(
    z
      .object({
        roleId: z.uuid(),
        accessScope: z.enum(["INSTITUTION", "TRAINING_PATHS"]),
        trainingPathIds: z.array(z.uuid()).refine((ids) => new Set(ids).size === ids.length, PEOPLE_ERROR_MESSAGES.INVALID_ROLE_CONFIGURATION),
      })
      .refine(
        (assignment) => (assignment.accessScope === "INSTITUTION" ? assignment.trainingPathIds.length === 0 : assignment.trainingPathIds.length > 0),
        PEOPLE_ERROR_MESSAGES.INVALID_ROLE_CONFIGURATION,
      ),
  )
  .min(1, PEOPLE_ERROR_MESSAGES.MINIMUM_ROLE)
  .refine((assignments) => new Set(assignments.map((a) => a.roleId)).size === assignments.length, PEOPLE_ERROR_MESSAGES.DUPLICATE_ROLE);
