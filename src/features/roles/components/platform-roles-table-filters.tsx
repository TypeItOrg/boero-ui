"use client";

import * as React from "react";
import { XIcon } from "lucide-react";

import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { Button } from "@common/components/ui/button";
import { DataTableFilters, type DataTableSelectFilter } from "@common/components/ui/data-table-filters";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import type { AsyncDropdownPage } from "@common/types/async-dropdown-page.types";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { buildPaginationSearchParams } from "@common/utils/pagination-query.util";
import { serializeSpringSort } from "@common/utils/sort-query.util";
import { LOCATION_ERROR_MESSAGES } from "@features/locations/constants/error-messages.constants";
import type { InstitutionSummary } from "@features/institutions/types/institution-summary.types";
import type { PlatformRoleType } from "@features/roles/types/platform-role-type.types";

const INSTITUTION_FILTER_QUERY_KEY = ["platform", "roles", "institution-filter"] as const;
const ROLE_TYPE_FILTER = "all";

type PlatformRolesTableFiltersProps = {
  institutionId: string | undefined;
  institutionName: string | undefined;
  roleType: PlatformRoleType | undefined;
  search: string;
  size: number;
};

export function PlatformRolesTableFilters({
  institutionId,
  institutionName,
  roleType,
  search,
  size,
}: PlatformRolesTableFiltersProps): React.ReactElement {
  const { navigate } = useDataTableNavigation();
  const roleTypeFilter: DataTableSelectFilter = {
    defaultValue: ROLE_TYPE_FILTER,
    label: "Tipo",
    name: "roleType",
    options: [
      { value: ROLE_TYPE_FILTER, label: "Todos los tipos" },
      { value: "SYSTEM", label: "Sistema" },
      { value: "CUSTOM", label: "Personalizado" },
    ],
    value: roleType ?? ROLE_TYPE_FILTER,
  };

  function updateInstitution(value: string | undefined): void {
    navigate({ institutionId: value, page: "0", size: String(size) }, { replace: true });
  }

  return (
    <DataTableFilters
      search={search}
      searchPlaceholder="Buscar por rol o institución..."
      selectFilters={[roleTypeFilter]}
      size={size}
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="text-foreground text-sm font-medium">Institución</span>
        <div className="flex min-w-0 gap-2">
          <AsyncDropdown<InstitutionSummary>
            className="min-w-0 flex-1"
            defaultOption={{ label: "Todas las instituciones", value: undefined }}
            emptyMessage="No se encontraron instituciones."
            errorMessage={LOCATION_ERROR_MESSAGES.FETCH_INSTITUTIONS}
            fetchPage={fetchInstitutionPage}
            getItemLabel={(institution) => institution.name}
            getItemValue={(institution) => institution.id}
            onValueChange={updateInstitution}
            pageSize={20}
            placeholder="Seleccionar institución"
            queryKey={INSTITUTION_FILTER_QUERY_KEY}
            searchPlaceholder="Buscar institución..."
            selectedLabel={institutionName}
            value={institutionId}
          />
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label="Limpiar institución"
            onClick={() => updateInstitution(undefined)}
            disabled={!institutionId}
          >
            <XIcon />
          </Button>
        </div>
      </div>
    </DataTableFilters>
  );
}

async function fetchInstitutionPage({
  page,
  search,
  signal,
  size,
}: AsyncDropdownFetchPageInput): Promise<AsyncDropdownPage<InstitutionSummary>> {
  const params = buildPaginationSearchParams({ page, size, search });
  params.set("sort", serializeSpringSort({ field: "name", direction: "asc" }));
  const response = await fetch(`/api/admin/institutions?${params.toString()}`, { signal });
  const data = await parseHttpResponse<PaginatedResponse<InstitutionSummary>>(
    response,
    LOCATION_ERROR_MESSAGES.FETCH_INSTITUTIONS,
  );
  return { items: data.items, nextPage: data.page + 1 < data.totalPages ? data.page + 1 : null };
}
