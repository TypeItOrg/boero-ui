import type { InstitutionRole } from "@features/roles/types/institution-role.types";

export type InstitutionRolePage = {
  items: InstitutionRole[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};
