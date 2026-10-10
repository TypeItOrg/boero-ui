"use client";

import type { ReactElement } from "react";

import { BuildingIcon } from "lucide-react";

import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";

import { fetchPlatformInstitutionOptions } from "@features/institutions/services/fetch-platform-institution-options.service";
import type { InstitutionSummary } from "@features/institutions/types/institution-summary.types";

export const INSTITUTION_FILTER_QUERY_KEY = ["platform", "academic", "institution-filter"] as const;

export function InstitutionFilterControl({ filter, size }: { filter: { selectedLabel?: string; value?: string }; size: number }): ReactElement {
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
