"use client";

import { BuildingIcon, XIcon } from "lucide-react";

import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { Button } from "@common/components/ui/button";
import { DataTableFilters, type DataTableSelectFilter } from "@common/components/ui/data-table-filters";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { fetchPlatformInstitutionOptions } from "@features/institutions/services/fetch-platform-institution-options.service";
import type { InstitutionSummary } from "@features/institutions/types/institution-summary.types";
import type { SystemRoleCode } from "@features/people/types/system-role-code.types";
import type { SystemRole } from "@features/people/types/system-role.types";
import { LOCATION_ERROR_MESSAGES } from "@features/locations/constants/error-messages.constants";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";

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
    options: [{ value: ALL_ROLES, label: "Todos los roles" }, ...roles.map((role) => ({ value: role.code, label: role.displayName }))],
    value: roleCode ?? ALL_ROLES,
  };

  function updateInstitution(value: string | undefined): void {
    navigate({ institutionId: value, page: "0", size: String(size) }, { replace: true });
  }

  return (
    <DataTableFilters search={search} searchPlaceholder="Buscar por nombre, apellido, documento o email..." selectFilters={[roleFilter]} size={size}>
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="text-foreground text-sm font-medium">Institución</span>
        <div className="flex min-w-0 gap-2">
          <AsyncDropdown<InstitutionSummary>
            className="min-w-0 flex-1"
            defaultOption={{ label: "Todas las instituciones", value: undefined }}
            emptyDescription="No hay instituciones disponibles para filtrar."
            emptyIcon={BuildingIcon}
            emptyMessage="No se encontraron instituciones."
            emptyTitle="No hay instituciones"
            errorMessage={LOCATION_ERROR_MESSAGES.FETCH_INSTITUTIONS}
            fetchPage={fetchPlatformInstitutionOptions}
            getItemLabel={getInstitutionLabel}
            getItemValue={getInstitutionValue}
            onValueChange={updateInstitution}
            pageSize={INSTITUTION_FILTER_PAGE_SIZE}
            placeholder="Seleccionar institución"
            queryKey={INSTITUTION_FILTER_QUERY_KEY}
            searchPlaceholder="Buscar institución..."
            selectedLabel={institutionName ?? (institutionId ? PEOPLE_ERROR_MESSAGES.INSTITUTION_UNAVAILABLE : undefined)}
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

function getInstitutionLabel(institution: InstitutionSummary): string {
  return institution.name;
}

function getInstitutionValue(institution: InstitutionSummary): string {
  return institution.id;
}
