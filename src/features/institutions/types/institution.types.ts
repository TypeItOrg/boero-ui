import type { InstitutionCity } from "@features/institutions/types/institution-city.types";
import type { InstitutionCountry } from "@features/institutions/types/institution-country.types";
import type { InstitutionProvince } from "@features/institutions/types/institution-province.types";
import type { InstitutionSummary } from "@features/institutions/types/institution-summary.types";

export type Institution = Omit<InstitutionSummary, "city" | "province"> & {
  city: InstitutionCity;
  province: InstitutionProvince;
  country: InstitutionCountry;
  street: string | null;
  number: string | null;
  neighborhood: string | null;
  additionalInfo: string | null;
  phoneNumber: string | null;
  email: string | null;
  active: boolean;
};
