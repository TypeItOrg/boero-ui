"use client";

import * as React from "react";

import {
  AsyncDropdown,
  type AsyncDropdownFetchPageInput,
  type AsyncDropdownPage,
} from "@common/components/ui/async-dropdown";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { buildPaginationSearchParams } from "@common/utils/pagination-query.util";
import { toAsyncDropdownPage } from "@common/utils/to-async-dropdown-page.util";
import { LOCATION_ERROR_MESSAGES } from "@features/locations/constants/error-messages.constants";
import type { City } from "@features/locations/types/city.types";
import type { Country } from "@features/locations/types/country.types";
import type { Province } from "@features/locations/types/province.types";

const LOCATION_PAGE_SIZE = 20;

type InitialLocation = {
  country: Country;
  province: Province;
  city: City;
};

type LocationPickerProps = {
  onValueChange: (value: string) => void;
  error?: string;
  initialLocation?: InitialLocation;
};

export function LocationPicker({ onValueChange, error, initialLocation }: LocationPickerProps): React.ReactElement {
  const [country, setCountry] = React.useState<Country | undefined>(() => initialLocation?.country);
  const [province, setProvince] = React.useState<Province | undefined>(() => initialLocation?.province);
  const [city, setCity] = React.useState<City | undefined>(() => initialLocation?.city);
  const countryError = error && !country ? LOCATION_ERROR_MESSAGES.REQUIRED_COUNTRY : undefined;
  const provinceError = error && country && !province ? LOCATION_ERROR_MESSAGES.REQUIRED_PROVINCE : undefined;
  const cityError = error && province && !city ? error : undefined;

  function handleSelectCountry(_value: string | undefined, item: Country | undefined): void {
    setCountry(item);
    setProvince(undefined);
    setCity(undefined);
    onValueChange("");
  }

  function handleSelectProvince(_value: string | undefined, item: Province | undefined): void {
    setProvince(item);
    setCity(undefined);
    onValueChange("");
  }

  function handleSelectCity(_value: string | undefined, item: City | undefined): void {
    setCity(item);
    onValueChange(item?.id ?? "");
  }

  return (
    <FieldGroup className="flex flex-row flex-wrap items-start gap-4">
      <Field data-invalid={!!countryError} className="flex-1 flex-[1_0_min(250px,100%)]">
        <FieldContent>
          <FieldLabel required>País</FieldLabel>
        </FieldContent>
        <AsyncDropdown<Country>
          ariaInvalid={!!countryError}
          emptyMessage="No se encontraron países."
          errorMessage={LOCATION_ERROR_MESSAGES.FETCH_COUNTRIES}
          fetchPage={fetchCountries}
          getItemLabel={getCountryLabel}
          getItemValue={getLocationValue}
          onValueChange={handleSelectCountry}
          pageSize={LOCATION_PAGE_SIZE}
          placeholder="Seleccionar país"
          queryKey={["locations", "countries"]}
          renderItem={renderCountryItem}
          searchPlaceholder="Buscar país..."
          selectedLabel={country ? getCountryLabel(country) : undefined}
          value={country?.id}
        />
        <FieldError>{countryError}</FieldError>
      </Field>

      <Field data-invalid={!!provinceError} className="flex-1 flex-[1_0_min(250px,100%)]">
        <FieldContent>
          <FieldLabel required>Provincia</FieldLabel>
        </FieldContent>
        <AsyncDropdown<Province>
          ariaInvalid={!!provinceError}
          disabled={!country}
          emptyMessage="No se encontraron provincias."
          errorMessage={LOCATION_ERROR_MESSAGES.FETCH_PROVINCES}
          fetchPage={(input) => fetchProvinces(input, country?.id)}
          getItemLabel={getLocationLabel}
          getItemValue={getLocationValue}
          onValueChange={handleSelectProvince}
          pageSize={LOCATION_PAGE_SIZE}
          placeholder="Seleccionar provincia"
          queryKey={["locations", "provinces", country?.id]}
          searchPlaceholder="Buscar provincia..."
          selectedLabel={province?.name}
          value={province?.id}
        />
        <FieldError>{provinceError}</FieldError>
      </Field>

      <Field data-invalid={!!cityError} className="flex-1 flex-[1_0_min(250px,100%)]">
        <FieldContent>
          <FieldLabel required>Ciudad</FieldLabel>
        </FieldContent>
        <AsyncDropdown<City>
          ariaInvalid={!!cityError}
          disabled={!province}
          emptyMessage="No se encontraron ciudades."
          errorMessage={LOCATION_ERROR_MESSAGES.FETCH_CITIES}
          fetchPage={(input) => fetchCities(input, province?.id)}
          getItemLabel={getLocationLabel}
          getItemValue={getLocationValue}
          onValueChange={handleSelectCity}
          pageSize={LOCATION_PAGE_SIZE}
          placeholder="Seleccionar ciudad"
          queryKey={["locations", "cities", province?.id]}
          searchPlaceholder="Buscar ciudad..."
          selectedLabel={city?.name}
          value={city?.id}
        />
        <FieldError>{cityError}</FieldError>
      </Field>
    </FieldGroup>
  );
}

async function fetchLocationPage<TItem>(
  path: string,
  { page, search, signal, size }: AsyncDropdownFetchPageInput,
): Promise<AsyncDropdownPage<TItem>> {
  const url = new URL(path, window.location.origin);
  url.search = buildPaginationSearchParams({ page, size, search }).toString();

  const response = await fetch(url, { signal });

  const data = await parseHttpResponse<PaginatedResponse<TItem>>(response, LOCATION_ERROR_MESSAGES.FETCH_LOCATION_PAGE);
  return toAsyncDropdownPage(data);
}

async function fetchCountries(input: AsyncDropdownFetchPageInput): Promise<AsyncDropdownPage<Country>> {
  return fetchLocationPage<Country>("/api/countries", input);
}

async function fetchProvinces(
  input: AsyncDropdownFetchPageInput,
  countryId: string | undefined,
): Promise<AsyncDropdownPage<Province>> {
  if (!countryId) return { items: [], nextPage: null };
  return fetchLocationPage<Province>(`/api/countries/${countryId}/provinces`, input);
}

async function fetchCities(
  input: AsyncDropdownFetchPageInput,
  provinceId: string | undefined,
): Promise<AsyncDropdownPage<City>> {
  if (!provinceId) return { items: [], nextPage: null };
  return fetchLocationPage<City>(`/api/provinces/${provinceId}/cities`, input);
}

function getLocationLabel(item: { name: string }): string {
  return item.name;
}

function getLocationValue(item: { id: string }): string {
  return item.id;
}

function getCountryLabel(country: Country): string {
  return country.name;
}

function renderCountryItem(country: Country): React.ReactNode {
  return <span className="truncate">{country.name}</span>;
}
