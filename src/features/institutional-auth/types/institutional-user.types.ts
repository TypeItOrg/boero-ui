import type { InstitutionalPermission } from "@features/institutional-auth/types/institutional-permission.types";

export type InstitutionalUser = {
  userId: string;
  personId?: string | null;
  name: string;
  lastName: string;
  documentNumber: string;
  institutionId: string;
  permissions: readonly InstitutionalPermission[];
};
