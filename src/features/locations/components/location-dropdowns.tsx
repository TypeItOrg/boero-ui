"use client";

import * as React from "react";
import { GlobeIcon, MapPinIcon } from "lucide-react";

import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import type { AsyncDropdownPage } from "@common/types/async-dropdown-page.types";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { buildPaginationSearchParams } from "@common/utils/pagination-query.util";
import { toAsyncDropdownPage } from "@common/utils/to-async-dropdown-page.util";
import { LOCATION_ERROR_MESSAGES } from "@features/locations/constants/error-messages.constants";
import type { City } from "@features/locations/types/city.types";
import type { Country } from "@features/locations/types/country.types";

const LOCATION_PAGE_SIZE = 20;
const CITY_OPTION_HEIGHT = 56;

type LocationDropdownProps<TItem> = {
  ariaInvalid?: boolean;
  id: string;
  name: string;
  initialItem?: TItem;
  onValueChange?: (value: string | undefined, item: TItem | undefined) => void;
  optional?: boolean;
};

export function CountryDropdown({
  ariaInvalid,
  id,
  name,
  initialItem,
  onValueChange,
  optional = false,
}: LocationDropdownProps<Country>): React.ReactElement {
  const [country, setCountry] = React.useState<Country | undefined>(initialItem);

  return (
    <AsyncDropdown<Country>
      ariaInvalid={ariaInvalid}
      id={id}
      name={name}
      defaultOption={optional ? { label: "Sin especificar", value: undefined } : undefined}
      emptyDescription="No encontramos países registrados."
      emptyIcon={GlobeIcon}
      emptyMessage="No se encontraron países."
      emptyTitle="No hay países"
      errorMessage={LOCATION_ERROR_MESSAGES.FETCH_COUNTRIES}
      fetchPage={(input) => fetchLocationPage<Country>("/api/countries", input)}
      getItemLabel={(item) => item.name}
      getItemValue={(item) => item.id}
      onValueChange={(value, item) => {
        setCountry(item);
        onValueChange?.(value, item);
      }}
      pageSize={LOCATION_PAGE_SIZE}
      placeholder="Seleccionar país"
      queryKey={["locations", "countries"]}
      searchPlaceholder="Buscar país..."
      selectedLabel={country?.name}
      value={country?.id}
    />
  );
}

export function CityDropdown({
  ariaInvalid,
  id,
  name,
  initialItem,
  onValueChange,
  optional = false,
}: LocationDropdownProps<City>): React.ReactElement {
  const [city, setCity] = React.useState<City | undefined>(initialItem);

  return (
    <AsyncDropdown<City>
      ariaInvalid={ariaInvalid}
      id={id}
      name={name}
      defaultOption={optional ? { label: "Sin especificar", value: undefined } : undefined}
      emptyDescription="No encontramos ciudades registradas."
      emptyIcon={MapPinIcon}
      emptyMessage="No se encontraron ciudades."
      emptyTitle="No hay ciudades"
      errorMessage={LOCATION_ERROR_MESSAGES.FETCH_CITIES}
      fetchPage={(input) => fetchLocationPage<City>("/api/cities", input)}
      getItemLabel={getCityLabel}
      getItemValue={(item) => item.id}
      estimateSize={CITY_OPTION_HEIGHT}
      onValueChange={(value, item) => {
        setCity(item);
        onValueChange?.(value, item);
      }}
      pageSize={LOCATION_PAGE_SIZE}
      placeholder="Seleccionar ciudad"
      queryKey={["locations", "cities"]}
      renderItem={(item) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate">{item.name}</span>
          {item.province ? <span className="text-muted-foreground truncate text-xs">{item.province}</span> : null}
        </span>
      )}
      searchPlaceholder="Buscar ciudad..."
      selectedLabel={city ? getCityLabel(city) : undefined}
      value={city?.id}
    />
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

function getCityLabel(city: City): string {
  return city.province ? `${city.name}, ${city.province}` : city.name;
}
