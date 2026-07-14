import type { InstitutionSummary } from "@features/institutions/types/institution-summary.types";

type InstitutionCity = {
  cityId: string;
  name: string;
};

type InstitutionProvince = {
  provinceId: string;
  name: string;
};

type InstitutionCountry = {
  countryId: string;
  isoCode: string;
  name: string;
};

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
