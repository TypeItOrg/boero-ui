"use client";

import * as React from "react";
import { BuildingIcon, LibraryBigIcon, RouteIcon } from "lucide-react";
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
import { academicSpaceFormatLabels, academicSpaceTypeLabels } from "@features/academic/utils/academic-labels.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type AcademicTableFiltersProps = {
  academicSpaceFilter?: CourseDropdownFilter;
  cycleFilter?: CourseDropdownFilter;
  dateFilters: readonly DataTableDateFilter[];
  filters: readonly DataTableSelectFilter[];
  institutionFilter?: { selectedLabel?: string; value?: string };
  search: string;
  searchPlaceholder?: string;
  searchable: boolean;
  size: number;
  studyPlanFilter?: CourseDropdownFilter;
  trainingPathFilter?: TrainingPathFilter;
  yearFilters: readonly DataTableYearFilter[];
};

type TrainingPathFilter = {
  institutionId: string;
  scope: AcademicScope;
  selectedLabel: string | undefined;
  value: string | undefined;
};

type CourseDropdownFilter = {
  institutionId: string;
  scope: AcademicScope;
  selectedLabel: string | undefined;
  value: string | undefined;
};

type CourseDropdownFilterControlProps = {
  emptyIcon: typeof LibraryBigIcon;
  filter: CourseDropdownFilter;
  label: string;
  resource: "study-plans" | "academic-spaces";
  searchPlaceholder: string;
  size: number;
};

export function AcademicTableFilters({
  academicSpaceFilter,
  cycleFilter,
  dateFilters,
  filters,
  institutionFilter,
  search,
  searchPlaceholder,
  searchable,
  size,
  studyPlanFilter,
  trainingPathFilter,
  yearFilters,
}: AcademicTableFiltersProps): React.ReactElement {
  return (
    <DataTableFilters
      dateFilters={dateFilters}
      search={searchable ? search : undefined}
      searchPlaceholder={searchable ? (searchPlaceholder ?? "Buscar por nombre…") : undefined}
      selectFilters={filters}
      size={size}
      yearFilters={yearFilters}
    >
      {institutionFilter ? <InstitutionFilterControl filter={institutionFilter} size={size} /> : null}
      {trainingPathFilter ? <TrainingPathFilterControl filter={trainingPathFilter} size={size} /> : null}
      {studyPlanFilter ? (
        <CourseDropdownFilterControl
          emptyIcon={RouteIcon}
          filter={studyPlanFilter}
          label="Plan de estudio"
          navigateKey="studyPlanId"
          resource="study-plans"
          searchPlaceholder="Buscar plan…"
          size={size}
        />
      ) : null}
      {academicSpaceFilter ? (
        <CourseDropdownFilterControl
          emptyIcon={LibraryBigIcon}
          filter={academicSpaceFilter}
          label="Espacio académico"
          navigateKey="academicSpaceId"
          resource="academic-spaces"
          searchPlaceholder="Buscar espacio…"
          size={size}
        />
      ) : null}
      {cycleFilter ? <CycleFilterControl filter={cycleFilter} size={size} /> : null}
    </DataTableFilters>
  );
}

const INSTITUTION_FILTER_QUERY_KEY = ["platform", "academic", "institution-filter"] as const;

function InstitutionFilterControl({ filter, size }: { filter: { selectedLabel?: string; value?: string }; size: number }): React.ReactElement {
  const { navigate } = useDataTableNavigation();

  function updateInstitution(value: string | undefined): void {
    navigate(
      {
        academicSpaceId: undefined,
        institutionId: value,
        page: "0",
        size: String(size),
        studyPlanId: undefined,
        trainingPathId: undefined,
        year: undefined,
      },
      { replace: true },
    );
  }

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
        onValueChange={updateInstitution}
        pageSize={20}
        placeholder="Seleccionar institución"
        queryKey={INSTITUTION_FILTER_QUERY_KEY}
        searchPlaceholder="Buscar institución…"
        selectedLabel={filter.selectedLabel}
        value={filter.value}
      />
    </div>
  );
}

const TRAINING_PATH_FILTER_QUERY_KEY = ["academic", "study-plans", "training-path-filter"] as const;
const TRAINING_PATH_FILTER_PAGE_SIZE = 20;
const CYCLE_FILTER_QUERY_KEY = ["academic", "courses", "cycle-filter"] as const;

function CycleFilterControl({ filter, size }: { filter: CourseDropdownFilter; size: number }): React.ReactElement {
  const { navigate } = useDataTableNavigation();
  const queryKey = React.useMemo(() => [...CYCLE_FILTER_QUERY_KEY, filter.scope, filter.institutionId], [filter.institutionId, filter.scope]);

  function updateCycle(value: string | undefined): void {
    navigate({ page: "0", size: String(size), year: value }, { replace: true });
  }

  const fetchPage = React.useCallback(
    (input: AsyncDropdownFetchPageInput) =>
      fetchAcademicOptionPage<{ id: string; year: number }>("academic-years", filter.scope, filter.institutionId, input, {
        active: "all",
      }),
    [filter.institutionId, filter.scope],
  );

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-foreground text-sm font-medium">Ciclo lectivo</span>
      <AsyncDropdown<{ id: string; year: number }>
        className="min-w-0"
        clearLabel="Limpiar ciclo lectivo"
        clearable
        defaultOption={{ label: "Todos los ciclos", value: undefined }}
        emptyMessage="No se encontraron ciclos lectivos."
        errorMessage="No se pudieron cargar los ciclos lectivos."
        fetchPage={fetchPage}
        getItemLabel={(item) => String(item.year)}
        getItemValue={(item) => String(item.year)}
        pageSize={TRAINING_PATH_FILTER_PAGE_SIZE}
        onValueChange={updateCycle}
        placeholder="Seleccionar ciclo"
        queryKey={queryKey}
        searchPlaceholder="Buscar año…"
        selectedLabel={filter.selectedLabel ?? (filter.value ? "Ciclo no disponible" : undefined)}
        value={filter.value}
      />
    </div>
  );
}

type CourseDropdownFilterControlPropsWithKey = CourseDropdownFilterControlProps & { navigateKey: "studyPlanId" | "academicSpaceId" };

function CourseDropdownFilterControl({
  emptyIcon,
  filter,
  label,
  navigateKey,
  resource,
  searchPlaceholder,
  size,
}: CourseDropdownFilterControlPropsWithKey): React.ReactElement {
  const { navigate } = useDataTableNavigation();
  const defaultLabel = resource === "study-plans" ? "Todos los planes de estudio" : "Todos los espacios académicos";
  const queryKey = React.useMemo(
    () => ["academic", "course-filter", resource, filter.scope, filter.institutionId],
    [filter.institutionId, filter.scope, resource],
  );

  function updateFilter(value: string | undefined): void {
    navigate(value ? { page: "0", size: String(size), [navigateKey]: value } : { page: "0", size: String(size), [navigateKey]: undefined }, {
      replace: true,
    });
  }

  const fetchPage = React.useCallback(
    (input: AsyncDropdownFetchPageInput) => fetchAcademicOptionPage(resource, filter.scope, filter.institutionId, input, { active: "all" }),
    [filter.institutionId, filter.scope, resource],
  );

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-foreground text-sm font-medium">{label}</span>
      <AsyncDropdown<{ id: string; name?: string; year?: number; type?: string; format?: string }>
        className="min-w-0"
        clearLabel={`Limpiar ${label.toLowerCase()}`}
        clearable
        defaultOption={{ label: defaultLabel, value: undefined }}
        emptyMessage="No se encontraron opciones."
        emptyIcon={emptyIcon}
        errorMessage="No se pudieron cargar las opciones."
        fetchPage={fetchPage}
        getItemLabel={(item) => {
          if (item.type && item.format) {
            const typeLabel = academicSpaceTypeLabels[item.type as keyof typeof academicSpaceTypeLabels] ?? item.type;
            const formatLabel = academicSpaceFormatLabels[item.format as keyof typeof academicSpaceFormatLabels] ?? item.format;
            return `${item.name} · ${typeLabel} · ${formatLabel}`;
          }
          return item.year !== undefined ? String(item.year) : (item.name ?? "");
        }}
        getItemValue={(item) => item.id}
        pageSize={TRAINING_PATH_FILTER_PAGE_SIZE}
        onValueChange={updateFilter}
        placeholder={`Seleccionar ${label.toLowerCase()}`}
        queryKey={queryKey}
        searchPlaceholder={searchPlaceholder}
        selectedLabel={filter.selectedLabel ?? (filter.value ? "Opción no disponible" : undefined)}
        value={filter.value}
      />
    </div>
  );
}

type TrainingPathFilterControlProps = {
  filter: TrainingPathFilter;
  size: number;
};

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
        searchPlaceholder="Buscar trayecto…"
        selectedLabel={filter.selectedLabel ?? (filter.value ? "Trayecto no disponible" : undefined)}
        value={filter.value}
      />
    </div>
  );
}
