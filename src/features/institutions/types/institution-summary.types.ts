type InstitutionSummaryCountry = {
  countryId: string;
  isoCode: string;
  name: string;
};

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
