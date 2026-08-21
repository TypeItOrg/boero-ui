import * as React from "react";
import { MapPinIcon } from "lucide-react";

import { FieldGroup } from "@common/components/ui/field";
import { DropdownField, TextField } from "@features/institutional-auth/components/institutional-profile-fields";
import type { InstitutionalPerson } from "@features/institutional-auth/types/institutional-person.types";
import { CityDropdown, CountryDropdown } from "@features/locations/components/location-dropdowns";

type LocationSectionProps = {
  fieldErrors: Record<string, string>;
  hasAddress: boolean;
  person: InstitutionalPerson;
  onAddressCityChange: (cityId: string | undefined) => void;
  onAddressStreetChange: (street: string) => void;
};

export function InstitutionalProfileLocationSection({
  fieldErrors,
  hasAddress,
  person,
  onAddressCityChange,
  onAddressStreetChange,
}: LocationSectionProps): React.ReactElement {
  return (
    <div className="bg-muted/25 rounded-xl border p-4 sm:p-5">
      <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
        <div className="flex items-center gap-3.5">
          <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
            <MapPinIcon className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Ubicación</h2>
            <p className="text-muted-foreground text-sm">Completá tu nacionalidad, ciudad de nacimiento y domicilio.</p>
          </div>
        </div>
      </header>
      <div className="mt-4 sm:mt-5">
        <FieldGroup className="flex flex-row flex-wrap items-start gap-4">
          <DropdownField id="profile-nationality" label="Nacionalidad" error={fieldErrors.nationalityCountryId}>
            <CountryDropdown
              ariaInvalid={Boolean(fieldErrors.nationalityCountryId)}
              id="profile-nationality"
              name="nationalityCountryId"
              initialItem={
                person.nationalityCountry
                  ? {
                      ...person.nationalityCountry,
                      isoCode: person.nationalityCountry.isoCode ?? "",
                    }
                  : undefined
              }
              optional
            />
          </DropdownField>
          <DropdownField id="profile-birth-city" label="Ciudad natal" error={fieldErrors.birthCityId}>
            <CityDropdown
              ariaInvalid={Boolean(fieldErrors.birthCityId)}
              id="profile-birth-city"
              name="birthCityId"
              initialItem={person.birthCity ?? undefined}
              optional
            />
          </DropdownField>
          <DropdownField id="profile-address-city" label="Ciudad del domicilio" error={fieldErrors["address.cityId"]} required={hasAddress}>
            <CityDropdown
              ariaInvalid={Boolean(fieldErrors["address.cityId"])}
              id="profile-address-city"
              name="address.cityId"
              initialItem={person.address?.city ?? undefined}
              onValueChange={onAddressCityChange}
              optional
            />
          </DropdownField>
          <TextField
            id="profile-address-street"
            name="address.street"
            label="Calle"
            defaultValue={person.address?.street ?? ""}
            error={fieldErrors["address.street"]}
            onChange={(event) => onAddressStreetChange(event.currentTarget.value)}
            required={hasAddress}
          />
          <TextField
            id="profile-address-number"
            name="address.number"
            label="Número"
            defaultValue={person.address?.number ?? ""}
            error={fieldErrors["address.number"]}
          />
          <TextField
            id="profile-address-floor"
            name="address.floor"
            label="Piso"
            defaultValue={person.address?.floor ?? ""}
            error={fieldErrors["address.floor"]}
          />
          <TextField
            id="profile-address-apartment"
            name="address.apartment"
            label="Departamento"
            defaultValue={person.address?.apartment ?? ""}
            error={fieldErrors["address.apartment"]}
          />
          <TextField
            id="profile-address-neighborhood"
            name="address.neighborhood"
            label="Barrio"
            defaultValue={person.address?.neighborhood ?? ""}
            error={fieldErrors["address.neighborhood"]}
          />
          <TextField
            id="profile-address-info"
            name="address.additionalInfo"
            label="Información adicional"
            defaultValue={person.address?.additionalInfo ?? ""}
            error={fieldErrors["address.additionalInfo"]}
          />
        </FieldGroup>
      </div>
    </div>
  );
}
