"use client";

import * as React from "react";
import { BuildingIcon, RouteIcon } from "lucide-react";
import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import {
  DataTableFilters,
  type DataTableDateFilter,
  type DataTableSelectFilter,
  type DataTableYearFilter,
} from "@common/components/ui/data-table-filters";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import { fetchAcademicOptionPage } from "@features/academic/services/academic-options.service";
import type { TrainingPath } from "@features/academic/types/training-path.types";
import type { InstitutionSummary } from "@features/institutions/types/institution-summary.types";
import { fetchPlatformInstitutionOptions } from "@features/institutions/services/fetch-platform-institution-options.service";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type AcademicTableFiltersProps = {
  dateFilters: readonly DataTableDateFilter[];
  filters: readonly DataTableSelectFilter[];
  institutionFilter?: { selectedLabel?: string; value?: string };
  search: string;
  searchPlaceholder?: string;
  searchable: boolean;
  size: number;
  trainingPathFilter?: TrainingPathFilter;
  yearFilters: readonly DataTableYearFilter[];
};

type TrainingPathFilter = {
  institutionId: string;
  scope: AcademicScope;
  selectedLabel: string | undefined;
  value: string | undefined;
};

type TrainingPathFilterControlProps = {
  filter: TrainingPathFilter;
  size: number;
};

export function AcademicTableFilters({
  dateFilters,
  filters,
  institutionFilter,
  search,
  searchPlaceholder,
  searchable,
  size,
  trainingPathFilter,
  yearFilters,
}: AcademicTableFiltersProps): React.ReactElement {
  return (
    <DataTableFilters
      dateFilters={dateFilters}
      search={searchable ? search : undefined}
      searchPlaceholder={searchable ? (searchPlaceholder ?? "Buscar por nombre...") : undefined}
      selectFilters={filters}
      size={size}
      yearFilters={yearFilters}
    >
      {institutionFilter ? <InstitutionFilterControl filter={institutionFilter} size={size} /> : null}
      {trainingPathFilter ? <TrainingPathFilterControl filter={trainingPathFilter} size={size} /> : null}
    </DataTableFilters>
  );
}

const INSTITUTION_FILTER_QUERY_KEY = ["platform", "academic", "institution-filter"] as const;

function InstitutionFilterControl({ filter, size }: { filter: { selectedLabel?: string; value?: string }; size: number }): React.ReactElement {
  const { navigate } = useDataTableNavigation();

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-foreground text-sm font-medium">Institución</span>
      <AsyncDropdown<InstitutionSummary>
        className="min-w-0"
        clearLabel="Limpiar institución"
        clearable
        defaultOption={{ label: "Todas las instituciones", value: undefined }}
        emptyDescription="No hay instituciones disponibles para filtrar."
        emptyIcon={BuildingIcon}
        emptyMessage="No se encontraron instituciones."
        emptyTitle="No hay instituciones"
        errorMessage="No se pudieron cargar las instituciones."
        fetchPage={fetchPlatformInstitutionOptions}
        getItemLabel={(item) => item.name}
        getItemValue={(item) => item.id}
        onValueChange={(value) => navigate({ institutionId: value, page: "0", size: String(size), trainingPathId: undefined }, { replace: true })}
        pageSize={20}
        placeholder="Seleccionar institución"
        queryKey={INSTITUTION_FILTER_QUERY_KEY}
        searchPlaceholder="Buscar institución..."
        selectedLabel={filter.selectedLabel}
        value={filter.value}
      />
    </div>
  );
}

const TRAINING_PATH_FILTER_QUERY_KEY = ["academic", "study-plans", "training-path-filter"] as const;
const TRAINING_PATH_FILTER_PAGE_SIZE = 20;

function TrainingPathFilterControl({ filter, size }: TrainingPathFilterControlProps): React.ReactElement {
  const { navigate } = useDataTableNavigation();
  const queryKey = React.useMemo(() => [...TRAINING_PATH_FILTER_QUERY_KEY, filter.scope, filter.institutionId], [filter.institutionId, filter.scope]);

  function updateTrainingPath(value: string | undefined): void {
    navigate({ page: "0", size: String(size), trainingPathId: value }, { replace: true });
  }

  const fetchPage = React.useCallback(
    (input: AsyncDropdownFetchPageInput) =>
      fetchAcademicOptionPage<TrainingPath>("training-paths", filter.scope, filter.institutionId, input, {
        active: "all",
      }),
    [filter.institutionId, filter.scope],
  );

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-foreground text-sm font-medium">Trayecto formativo</span>
      <AsyncDropdown<TrainingPath>
        className="min-w-0"
        clearLabel="Limpiar trayecto formativo"
        clearable
        defaultOption={{ label: "Todos los trayectos", value: undefined }}
        emptyDescription="Todavía no se registraron trayectos formativos en esta institución."
        emptyIcon={RouteIcon}
        emptyMessage="No se encontraron trayectos formativos."
        emptyTitle="No hay trayectos formativos"
        errorMessage="No se pudieron cargar los trayectos formativos."
        fetchPage={fetchPage}
        getItemLabel={(item) => (item.active ? item.name : `${item.name} · Inactivo`)}
        getItemValue={(item) => item.id}
        pageSize={TRAINING_PATH_FILTER_PAGE_SIZE}
        onValueChange={updateTrainingPath}
        placeholder="Seleccionar trayecto"
        queryKey={queryKey}
        searchPlaceholder="Buscar trayecto..."
        selectedLabel={filter.selectedLabel ?? (filter.value ? "Trayecto no disponible" : undefined)}
        value={filter.value}
      />
    </div>
  );
}
