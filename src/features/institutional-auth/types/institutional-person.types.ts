export type InstitutionalCity = {
  id: string;
  name: string;
  provinceId?: string;
  province?: string;
};

export type InstitutionalCountry = {
  id: string;
  name: string;
  isoCode?: string;
};

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

export type InstitutionalPerson = {
  personId: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  birthDate: string | null;
  phoneNumber: string | null;
  email: string | null;
  institutionId: string;
  institutionName: string;
  address: InstitutionalAddress | null;
  birthCity: InstitutionalCity | null;
  nationalityCountry: InstitutionalCountry | null;
  deleted: boolean;
};
