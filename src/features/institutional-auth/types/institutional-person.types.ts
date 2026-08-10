import type { InstitutionalAddress } from "@features/institutional-auth/types/institutional-address.types";
import type { InstitutionalCity } from "@features/institutional-auth/types/institutional-city.types";
import type { InstitutionalCountry } from "@features/institutional-auth/types/institutional-country.types";

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
