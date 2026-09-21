import { z } from "zod";

import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";

const institutionalUserResponseSchema = z.object({
  user: z.object({
    userId: z.string().min(1),
    personId: z.string().nullable().optional(),
    name: z.string(),
    lastName: z.string(),
    documentNumber: z.string(),
    institutionId: z.string().min(1),
    roles: z.array(z.string()).default([]),
    permissions: z.array(z.string()).default([]),
    permissionScopes: z
      .record(
        z.string(),
        z.object({
          accessScope: z.enum(["INSTITUTION", "TRAINING_PATHS"]),
          trainingPathIds: z.array(z.string()),
        }),
      )
      .optional(),
  }),
});

export function parseInstitutionalUser(payload: unknown): InstitutionalUser | null {
  const result = institutionalUserResponseSchema.safeParse(payload);
  if (!result.success) return null;

  return result.data.user;
}
