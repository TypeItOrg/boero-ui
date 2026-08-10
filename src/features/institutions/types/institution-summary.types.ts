import type { InstitutionSummaryCountry } from "@features/institutions/types/institution-summary-country.types";

export type InstitutionSummary = {
  id: string;
  name: string;
  slug: string;
  country: InstitutionSummaryCountry;
  city: string;
  province: string;
  active: boolean;
  userCount: number;
};
