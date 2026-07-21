import { z } from "zod";

import { isInstitutionalPermission } from "@features/institutional-auth/types/institutional-permission.types";
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
  }),
});

export function parseInstitutionalUser(payload: unknown): InstitutionalUser | null {
  const result = institutionalUserResponseSchema.safeParse(payload);
  if (!result.success) return null;

  return {
    ...result.data.user,
    permissions: result.data.user.permissions.filter(isInstitutionalPermission),
  };
}
