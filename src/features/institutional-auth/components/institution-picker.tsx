"use client";

import { BuildingIcon } from "lucide-react";
import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import type { AsyncDropdownPage } from "@common/types/async-dropdown-page.types";
import { buildPaginationSearchParams } from "@common/utils/pagination-query.util";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { serializeSpringSort } from "@common/utils/sort-query.util";
import { toAsyncDropdownPage } from "@common/utils/to-async-dropdown-page.util";
import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";

export type InstitutionalInstitution = {
  id: string;
  name: string;
  city: string;
  province: string;
};

type InstitutionPickerProps = {
  ariaInvalid?: boolean;
  id: string;
  onValueChange: (value: string | undefined, item: InstitutionalInstitution | undefined) => void;
  selectedLabel?: string;
  value?: string;
};

const INSTITUTION_QUERY_KEY = ["institutional-auth", "institutions"] as const;
const INSTITUTION_OPTION_HEIGHT = 52;

export function InstitutionPicker({
  ariaInvalid,
  id,
  onValueChange,
  selectedLabel,
  value,
}: InstitutionPickerProps): React.ReactElement {
  return (
    <AsyncDropdown<InstitutionalInstitution>
      ariaInvalid={ariaInvalid}
      emptyDescription="No encontramos instituciones activas disponibles para iniciar sesión."
      emptyIcon={BuildingIcon}
      emptyMessage="No se encontraron instituciones activas."
      emptyTitle="No hay instituciones activas"
      errorMessage={INSTITUTIONAL_AUTH_ERROR_MESSAGES.FETCH_INSTITUTIONS}
      estimateSize={INSTITUTION_OPTION_HEIGHT}
      fetchPage={fetchInstitutionPage}
      getItemLabel={getInstitutionLabel}
      getItemValue={getInstitutionValue}
      id={id}
      name="institutionId"
      onValueChange={onValueChange}
      placeholder="Seleccionar institución"
      queryKey={INSTITUTION_QUERY_KEY}
      renderItem={renderInstitutionItem}
      searchPlaceholder="Buscar institución..."
      selectedLabel={selectedLabel}
      value={value}
    />
  );
}

async function fetchInstitutionPage({
  page,
  search,
  signal,
  size,
}: AsyncDropdownFetchPageInput): Promise<AsyncDropdownPage<InstitutionalInstitution>> {
  const searchParams = buildPaginationSearchParams({ page, search, size });
  searchParams.set("active", "true");
  searchParams.set("sort", serializeSpringSort({ field: "name", direction: "asc" }));

  const response = await fetch(`/api/institutions?${searchParams.toString()}`, { signal });
  const data = await parseHttpResponse<{
    items: InstitutionalInstitution[];
    page: number;
    totalPages: number;
  }>(response, INSTITUTIONAL_AUTH_ERROR_MESSAGES.FETCH_INSTITUTIONS);

  return toAsyncDropdownPage({ ...data, size, totalItems: 0 });
}

function getInstitutionLabel(institution: InstitutionalInstitution): string {
  return institution.name;
}

function getInstitutionValue(institution: InstitutionalInstitution): string {
  return institution.id;
}

function renderInstitutionItem(institution: InstitutionalInstitution): React.ReactElement {
  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate leading-tight">{institution.name}</span>
      <span className="text-muted-foreground truncate text-xs leading-tight">
        {institution.city}, {institution.province}
      </span>
    </span>
  );
}
