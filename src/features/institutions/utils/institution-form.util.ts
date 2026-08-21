import type { UseFormSetError } from "react-hook-form";

import type { LocationPicker } from "@features/locations/components/location-picker";
import type { InstitutionFormInput } from "@features/institutions/schemas/institution-form.schema";
import type { Institution } from "@features/institutions/types/institution.types";
import type { InstitutionActionState } from "@features/institutions/types/institution-action-state.types";
import type { InstitutionFormFieldName } from "@features/institutions/types/institution-form-field-name.types";

export type InitialLocation = React.ComponentProps<typeof LocationPicker>["initialLocation"];

export const EMPTY_FORM_VALUES: InstitutionFormInput = {
  name: "",
  slug: "",
  cityId: "",
  street: "",
  number: "",
  neighborhood: "",
  additionalInfo: "",
  phoneNumber: "",
  email: "",
};

export function getDefaultValues(institution: Institution | undefined): InstitutionFormInput {
  if (!institution) return EMPTY_FORM_VALUES;

  return {
    name: institution.name,
    slug: institution.slug,
    cityId: institution.city.cityId,
    street: institution.street ?? "",
    number: institution.number ?? "",
    neighborhood: institution.neighborhood ?? "",
    additionalInfo: institution.additionalInfo ?? "",
    phoneNumber: institution.phoneNumber ?? "",
    email: institution.email ?? "",
  };
}

export function getInitialLocation(institution: Institution | undefined): InitialLocation {
  if (!institution) return undefined;

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

export function getSubmitLabel({ isEdit, isPending }: { isEdit: boolean; isPending: boolean }): string {
  if (isPending) return isEdit ? "Guardando..." : "Creando...";
  return isEdit ? "Guardar cambios" : "Crear institución";
}

export function setActionFieldErrors(result: InstitutionActionState, setError: UseFormSetError<InstitutionFormInput>): boolean {
  if (!result.fieldErrors) return false;

  let hasFieldErrors = false;
  for (const [field, message] of Object.entries(result.fieldErrors)) {
    if (message) {
      setError(field as InstitutionFormFieldName, { message });
      hasFieldErrors = true;
    }
  }

  return hasFieldErrors;
}
