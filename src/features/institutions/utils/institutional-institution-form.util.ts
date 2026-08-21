import type { UseFormSetError } from "react-hook-form";

import type { LocationPicker } from "@features/locations/components/location-picker";
import type { InstitutionalInstitutionFormInput } from "@features/institutions/schemas/institutional-institution-form.schema";
import type { InstitutionActionState } from "@features/institutions/types/institution-action-state.types";
import type { Institution } from "@features/institutions/types/institution.types";

export type InitialLocation = React.ComponentProps<typeof LocationPicker>["initialLocation"];

export function getDefaultValues(institution: Institution): InstitutionalInstitutionFormInput {
  return {
    name: institution.name,
    cityId: institution.city.cityId,
    street: institution.street ?? "",
    number: institution.number ?? "",
    neighborhood: institution.neighborhood ?? "",
    additionalInfo: institution.additionalInfo ?? "",
    phoneNumber: institution.phoneNumber ?? "",
    email: institution.email ?? "",
  };
}

export function getInitialLocation(institution: Institution): InitialLocation {
  return {
    country: {
      id: institution.country.countryId,
      isoCode: institution.country.isoCode,
      name: institution.country.name,
    },
    province: {
      id: institution.province.provinceId,
      name: institution.province.name,
    },
    city: {
      id: institution.city.cityId,
      name: institution.city.name,
      province: institution.province.name,
      provinceId: institution.province.provinceId,
    },
  };
}

export function applyServerErrors(
  state: InstitutionActionState,
  setError: UseFormSetError<InstitutionalInstitutionFormInput>,
  setFormError: (error: string) => void,
): void {
  if (state.error) setFormError(state.error);
  if (!state.fieldErrors) return;

  for (const [field, message] of Object.entries(state.fieldErrors)) {
    if (message) {
      setError(field as keyof InstitutionalInstitutionFormInput, { type: "server", message });
    }
  }
}
