"use client";

import type { ReactElement } from "react";

import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { DataTableFilters, type DataTableSelectFilter } from "@common/components/ui/data-table-filters";
import type { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import type { AsyncDropdownPage } from "@common/types/async-dropdown-page.types";
import type { PaginatedResponse } from "@common/types/paginated-response.types";

import type { AcademicYear } from "@features/academic/types/academic-year.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import type { EnrollmentPeriod } from "@features/enrollment-periods/types/enrollment-period.types";
import { fetchPlatformInstitutionOptions } from "@features/institutions/services/fetch-platform-institution-options.service";
import type { InstitutionSummary } from "@features/institutions/types/institution-summary.types";

export function EnrollmentPeriodTableFilters({
  advancedFilterCount,
  selectedAcademicYear,
  fetchAcademicYears,
  scope,
  institutionId,
  navigate,
  data,
  isNavigating,
  search,
  statusFilter,
  institutionName,
}: {
  advancedFilterCount: 0 | 1;
  selectedAcademicYear: AcademicYear | null | undefined;
  fetchAcademicYears: (input: AsyncDropdownFetchPageInput) => Promise<AsyncDropdownPage<AcademicYear>>;
  scope: AcademicScope;
  institutionId: string;
  navigate: ReturnType<typeof useDataTableNavigation>["navigate"];
  data: PaginatedResponse<EnrollmentPeriod>;
  isNavigating: boolean;
  search: string;
  statusFilter: DataTableSelectFilter;
  institutionName: string | undefined;
}): ReactElement {
  return (
    <DataTableFilters
      activeAdvancedCount={advancedFilterCount}
      advancedFilters={
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">Ciclo lectivo</span>
          <AsyncDropdown<AcademicYear>
            value={selectedAcademicYear?.id}
            selectedLabel={selectedAcademicYear ? `Ciclo ${selectedAcademicYear.year}` : undefined}
            clearLabel="Limpiar ciclo lectivo"
            clearable
            defaultOption={{ label: "Todos los ciclos", value: undefined }}
            fetchPage={fetchAcademicYears}
            queryKey={["enrollment-period-academic-years", scope, institutionId]}
            getItemValue={(year) => year.id}
            getItemLabel={(year) => `Ciclo ${year.year}`}
            onValueChange={(academicYearId) => navigate({ academicYearId, page: "0", size: String(data.size) }, { replace: true })}
            placeholder="Seleccionar ciclo"
            searchPlaceholder="Buscar ciclo lectivo…"
            disabled={isNavigating}
          />
        </div>
      }
      advancedResetKeys={["academicYearId"]}
      search={search}
      searchPlaceholder="Buscar por nombre…"
      selectFilters={[statusFilter]}
      size={data.size}
      triggerPosition="external"
    >
      {scope === AcademicScope.ADMIN ? (
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">Institución</span>
          <AsyncDropdown<InstitutionSummary>
            value={institutionId}
            selectedLabel={institutionName}
            fetchPage={fetchPlatformInstitutionOptions}
            queryKey={["enrollment-period-institutions"]}
            getItemValue={(institution) => institution.id}
            getItemLabel={(institution) => institution.name}
            onValueChange={(value) => {
              if (value) {
                navigate(
                  {
                    institutionId: value,
                    academicYearId: undefined,
                    page: "0",
                    size: String(data.size),
                  },
                  { replace: true },
                );
              }
            }}
            placeholder="Seleccionar institución"
            searchPlaceholder="Buscar institución…"
            disabled={isNavigating}
          />
        </div>
      ) : null}
    </DataTableFilters>
  );
}
