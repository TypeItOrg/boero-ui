"use client";

import { useCallback, useMemo, type ReactElement } from "react";

import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";

import { type CourseDropdownFilter } from "@features/academic/components/academic-course-dropdown-filter";
import { TRAINING_PATH_FILTER_PAGE_SIZE } from "@features/academic/components/academic-training-path-filter";
import { fetchAcademicOptionPage } from "@features/academic/services/academic-options.service";

export const CYCLE_FILTER_QUERY_KEY = ["academic", "courses", "cycle-filter"] as const;

export function CycleFilterControl({ filter, size }: { filter: CourseDropdownFilter; size: number }): ReactElement {
  const { navigate } = useDataTableNavigation();

  const queryKey = useMemo(() => [...CYCLE_FILTER_QUERY_KEY, filter.scope, filter.institutionId], [filter.institutionId, filter.scope]);

  function updateCycle(value: string | undefined): void {
    navigate({ page: "0", size: String(size), year: value }, { replace: true });
  }

  const fetchPage = useCallback(
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
