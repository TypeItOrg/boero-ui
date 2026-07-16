"use client";

import * as React from "react";

import {
  AsyncDropdown,
  type AsyncDropdownFetchPageInput,
  type AsyncDropdownPage,
} from "@common/components/ui/async-dropdown";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@common/components/ui/field";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { buildPaginationSearchParams } from "@common/utils/pagination-query.util";
import { toAsyncDropdownPage } from "@common/utils/to-async-dropdown-page.util";
import { LOCATION_ERROR_MESSAGES } from "@features/locations/constants/error-messages.constants";
import type { City } from "@features/locations/types/city.types";
import type { Country } from "@features/locations/types/country.types";
import type { Province } from "@features/locations/types/province.types";

const LOCATION_PAGE_SIZE = 20;

export function LocationDropdownDemo(): React.ReactElement {
  const [country, setCountry] = React.useState<Country | undefined>();
  const [province, setProvince] = React.useState<Province | undefined>();
  const [city, setCity] = React.useState<City | undefined>();

  function selectCountry(_value: string | undefined, item: Country | undefined) {
    setCountry(item);
    setProvince(undefined);
    setCity(undefined);
  }

  function selectProvince(_value: string | undefined, item: Province | undefined) {
    setProvince(item);
    setCity(undefined);
  }

  function selectCity(_value: string | undefined, item: City | undefined) {
    setCity(item);
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Selector de ubicación</CardTitle>
        <CardDescription>Demo de búsqueda remota, scroll virtual e infinite scroll encadenado.</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldContent>
              <FieldLabel>País</FieldLabel>
              <FieldDescription>Primero elegí el país para habilitar las provincias.</FieldDescription>
            </FieldContent>
            <AsyncDropdown<Country>
              emptyMessage="No se encontraron países."
              errorMessage={LOCATION_ERROR_MESSAGES.FETCH_COUNTRIES}
              fetchPage={fetchCountries}
              getItemLabel={getCountryLabel}
              getItemValue={getLocationValue}
              onValueChange={selectCountry}
              pageSize={LOCATION_PAGE_SIZE}
              placeholder="Seleccionar país"
              queryKey={["locations", "countries"]}
              renderItem={renderCountryItem}
              searchPlaceholder="Buscar país..."
              selectedLabel={country ? getCountryLabel(country) : undefined}
              value={country?.id}
            />
          </Field>

          <Field data-disabled={!country}>
            <FieldContent>
              <FieldLabel>Provincia</FieldLabel>
              <FieldDescription>La lista depende del país seleccionado.</FieldDescription>
            </FieldContent>
            <AsyncDropdown<Province>
              disabled={!country}
              emptyMessage="No se encontraron provincias."
              errorMessage={LOCATION_ERROR_MESSAGES.FETCH_PROVINCES}
              fetchPage={(input) => fetchProvinces(input, country?.id)}
              getItemLabel={getLocationLabel}
              getItemValue={getLocationValue}
              onValueChange={selectProvince}
              pageSize={LOCATION_PAGE_SIZE}
              placeholder="Seleccionar provincia"
              queryKey={["locations", "provinces", country?.id]}
              searchPlaceholder="Buscar provincia..."
              selectedLabel={province?.name}
              value={province?.id}
            />
          </Field>

          <Field data-disabled={!province}>
            <FieldContent>
              <FieldLabel>Ciudad</FieldLabel>
              <FieldDescription>La lista depende de la provincia seleccionada.</FieldDescription>
            </FieldContent>
            <AsyncDropdown<City>
              disabled={!province}
              emptyMessage="No se encontraron ciudades."
              errorMessage={LOCATION_ERROR_MESSAGES.FETCH_CITIES}
              fetchPage={(input) => fetchCities(input, province?.id)}
              getItemLabel={getLocationLabel}
              getItemValue={getLocationValue}
              onValueChange={selectCity}
              pageSize={LOCATION_PAGE_SIZE}
              placeholder="Seleccionar ciudad"
              queryKey={["locations", "cities", province?.id]}
              searchPlaceholder="Buscar ciudad..."
              selectedLabel={city?.name}
              value={city?.id}
            />
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
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

function getLocationLabel(item: { name: string }): string {
  return item.name;
}

function getLocationValue(item: { id: string }): string {
  return item.id;
}

function getCountryLabel(country: Country): string {
  return `${country.name} (${country.isoCode})`;
}

function renderCountryItem(country: Country): React.ReactNode {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="truncate">{country.name}</span>
      <span className="text-muted-foreground ml-auto text-xs">{country.isoCode}</span>
    </span>
  );
}
