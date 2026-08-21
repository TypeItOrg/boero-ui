import type { InstitutionalPermission } from "@features/institutional-auth/types/institutional-permission.types";

export type ResourceActionConfig = {
  createPath: (base: string, parentId: string | undefined, data: Record<string, unknown>) => string;
  createPermission: InstitutionalPermission;
  updatePermission: InstitutionalPermission;
  prepareBody?: (data: Record<string, unknown>) => Record<string, unknown>;
};
