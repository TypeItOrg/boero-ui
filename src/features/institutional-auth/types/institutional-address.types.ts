import type { InstitutionalCity } from "@features/institutional-auth/types/institutional-city.types";

export type InstitutionalAddress = {
  id?: string;
  street: string;
  number?: string | null;
  floor?: string | null;
  apartment?: string | null;
  neighborhood?: string | null;
  additionalInfo?: string | null;
  city?: InstitutionalCity | null;
};
