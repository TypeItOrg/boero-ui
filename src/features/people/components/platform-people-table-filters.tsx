"use client";

import { XIcon } from "lucide-react";

import {
  AsyncDropdown,
  type AsyncDropdownFetchPageInput,
  type AsyncDropdownPage,
} from "@common/components/ui/async-dropdown";
import { Button } from "@common/components/ui/button";
import { DataTableFilters, type DataTableSelectFilter } from "@common/components/ui/data-table-filters";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { createHttpResponseError } from "@common/utils/create-http-error.util";
import { buildPaginationSearchParams } from "@common/utils/pagination-query.util";
import { serializeSpringSort } from "@common/utils/sort-query.util";
import { toAsyncDropdownPage } from "@common/utils/to-async-dropdown-page.util";
import type { InstitutionSummary } from "@features/institutions/types/institution-summary.types";
import type { SystemRole, SystemRoleCode } from "@features/people/types/person-role.types";

const INSTITUTION_FILTER_QUERY_KEY = ["platform", "institutions", "people-filter"] as const;
const INSTITUTION_FILTER_PAGE_SIZE = 20;
const ALL_ROLES = "all";

type RoleFilterValue = SystemRoleCode | typeof ALL_ROLES;

type PlatformPeopleTableFiltersProps = {
  institutionId: string | undefined;
  institutionName: string | undefined;
  roleCode: SystemRoleCode | undefined;
  roles: SystemRole[];
  search: string;
  size: number;
};

export function PlatformPeopleTableFilters({
  institutionId,
  institutionName,
  roleCode,
  roles,
  search,
  size,
}: PlatformPeopleTableFiltersProps): React.ReactElement {
  const { navigate } = useDataTableNavigation();
  const roleFilter: DataTableSelectFilter<RoleFilterValue> = {
    defaultValue: ALL_ROLES,
    label: "Rol",
    name: "roleCode",
    options: [
      { value: ALL_ROLES, label: "Todos los roles" },
      ...roles.map((role) => ({ value: role.code, label: role.displayName })),
    ],
    value: roleCode ?? ALL_ROLES,
  };

  function updateInstitution(value: string | undefined): void {
    navigate({ institutionId: value, page: "0", size: String(size) }, { replace: true });
  }

  return (
    <DataTableFilters
      className="md:grid-cols-[minmax(16rem,1fr)_minmax(14rem,18rem)_minmax(10rem,14rem)]"
      search={search}
      searchPlaceholder="Buscar por nombre, apellido, documento o email..."
      selectFilters={[roleFilter]}
      size={size}
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="text-foreground text-sm font-medium">Institución</span>
        <div className="flex min-w-0 gap-2">
          <AsyncDropdown<InstitutionSummary>
            className="min-w-0 flex-1"
            defaultOption={{ label: "Todas las instituciones", value: undefined }}
            emptyMessage="No se encontraron instituciones."
            errorMessage="No se pudieron cargar las instituciones."
            fetchPage={fetchInstitutionPage}
            getItemLabel={getInstitutionLabel}
            getItemValue={getInstitutionValue}
            onValueChange={updateInstitution}
            pageSize={INSTITUTION_FILTER_PAGE_SIZE}
            placeholder="Seleccionar institución"
            queryKey={INSTITUTION_FILTER_QUERY_KEY}
            searchPlaceholder="Buscar institución..."
            selectedLabel={institutionName ?? (institutionId ? "Institución no disponible" : undefined)}
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
  const searchParams = buildPaginationSearchParams({ page, size, search });
  searchParams.set("sort", serializeSpringSort({ field: "name", direction: "asc" }));
  const response = await fetch(`/api/platform/institutions?${searchParams.toString()}`, { signal });

  if (!response.ok) {
    throw createHttpResponseError(response, `Institution request failed with status ${response.status}`);
  }

  const data = (await response.json()) as PaginatedResponse<InstitutionSummary>;
  return toAsyncDropdownPage(data);
}

function getInstitutionLabel(institution: InstitutionSummary): string {
  return institution.name;
}

function getInstitutionValue(institution: InstitutionSummary): string {
  return institution.id;
}
