"use client";

import { useCallback, useMemo, type ReactElement } from "react";

import { LibraryBigIcon } from "lucide-react";

import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";

import { TRAINING_PATH_FILTER_PAGE_SIZE } from "@features/academic/components/academic-training-path-filter";
import { fetchAcademicOptionPage } from "@features/academic/services/academic-options.service";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { ACADEMIC_SPACE_OPTION_PRESENTATION, getAcademicSpaceOptionLabel } from "@features/academic/utils/academic-space-option.util";
import { formatStudyPlanLabel } from "@features/academic/utils/study-plan-label.util";

export function CourseDropdownFilterControl({
  emptyIcon,
  filter,
  label,
  navigateKey,
  resource,
  searchPlaceholder,
  size,
}: CourseDropdownFilterControlProps): ReactElement {
  const { navigate } = useDataTableNavigation();

  const defaultLabel = resource === "study-plans" ? "Todos los planes de estudio" : "Todos los espacios académicos";

  const queryKey = useMemo(
    () => ["academic", "course-filter", resource, filter.scope, filter.institutionId],
    [filter.institutionId, filter.scope, resource],
  );

  function updateFilter(value: string | undefined): void {
    navigate(value ? { page: "0", size: String(size), [navigateKey]: value } : { page: "0", size: String(size), [navigateKey]: undefined }, {
      replace: true,
    });
  }

  const fetchPage = useCallback(
    (input: AsyncDropdownFetchPageInput) =>
      fetchAcademicOptionPage(resource, filter.scope, filter.institutionId, input, {
        active: "all",
      }),
    [filter.institutionId, filter.scope, resource],
  );

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-foreground text-sm font-medium">{label}</span>
      <AsyncDropdown<{
        id: string;
        name?: string;
        year?: number;
        type?: string;
        format?: string;
        trainingPathName?: string;
        versionNumber?: number;
      }>
        {...(resource === "academic-spaces" ? ACADEMIC_SPACE_OPTION_PRESENTATION : {})}
        className="min-w-0"
        clearLabel={`Limpiar ${label.toLowerCase()}`}
        clearable
        defaultOption={{ label: defaultLabel, value: undefined }}
        emptyMessage="No se encontraron opciones."
        emptyIcon={emptyIcon}
        errorMessage="No se pudieron cargar las opciones."
        fetchPage={fetchPage}
        getItemLabel={(item) => {
          if (resource === "study-plans") {
            return formatStudyPlanLabel(item);
          }

          if (item.type && item.format) {
            return getAcademicSpaceOptionLabel(item);
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

export type CourseDropdownFilterControlProps = {
  emptyIcon: typeof LibraryBigIcon;
  filter: CourseDropdownFilter;
  label: string;
  navigateKey: "studyPlanId" | "academicSpaceId";
  resource: "study-plans" | "academic-spaces";
  searchPlaceholder: string;
  size: number;
};

export type CourseDropdownFilter = {
  institutionId: string;
  scope: AcademicScope;
  selectedLabel: string | undefined;
  value: string | undefined;
};
