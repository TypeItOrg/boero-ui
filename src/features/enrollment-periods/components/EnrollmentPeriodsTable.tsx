"use client";

import { useCallback, useState, type ReactNode } from "react";

import { Loader2Icon, PlusIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Button } from "@common/components/ui/button";
import { DataTableAdvancedFiltersTrigger } from "@common/components/ui/data-table-advanced-filters-trigger";
import { type DataTableSelectFilter } from "@common/components/ui/data-table-filters";
import { DataTableNavigationProvider, useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import { Sheet } from "@common/components/ui/sheet";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import { PAGE_SIZE_OPTIONS } from "@common/utils/pagination-query.util";

import { fetchAcademicOptionPage } from "@features/academic/services/academic-options.service";
import type { AcademicYear } from "@features/academic/types/academic-year.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { EnrollmentPeriodDeleteDialog } from "@features/enrollment-periods/components/enrollment-period-delete-dialog";
import { EnrollmentPeriodEmptyState } from "@features/enrollment-periods/components/enrollment-period-empty-state";
import { EnrollmentPeriodResultsTable } from "@features/enrollment-periods/components/enrollment-period-results-table";
import { EnrollmentPeriodTableFilters } from "@features/enrollment-periods/components/enrollment-period-table-filters";
import { useEnrollmentPeriodStatus } from "@features/enrollment-periods/hooks/use-enrollment-period-status";
import { ENROLLMENT_PERIOD_STATUS } from "@features/enrollment-periods/types/enrollment-period-status.types";
import { type EnrollmentPeriodsTableProps } from "@features/enrollment-periods/types/enrollment-periods-table-props.types";
import { PlatformCollectionActions } from "@features/platform-auth/components/platform-collection-actions";

export function EnrollmentPeriodsTable(props: EnrollmentPeriodsTableProps) {
  return (
    <DataTableNavigationProvider>
      <Sheet>
        <EnrollmentPeriodsTableContent {...props} />
      </Sheet>
    </DataTableNavigationProvider>
  );
}

function EnrollmentPeriodsTableContent({
  institutionId,
  data,
  selectedAcademicYear,
  institutionName,
  search,
  status,
  canCreate,
  canUpdate,
  canChangeStatus,
  canDelete,
  scope = AcademicScope.INSTITUTIONAL,
}: EnrollmentPeriodsTableProps) {
  const { isPending: isNavigating, navigate } = useDataTableNavigation();

  const fetchAcademicYears = useCallback(
    (input: AsyncDropdownFetchPageInput) =>
      fetchAcademicOptionPage<AcademicYear>("academic-years", scope, institutionId, input, {
        active: "all",
      }),
    [scope, institutionId],
  );

  const [deletingPeriodId, setDeletingPeriodId] = useState<string | null>(null);

  const statusFilter: DataTableSelectFilter = {
    defaultValue: "all",
    label: "Estado",
    name: "status",
    options: [
      { label: "Todos los estados", value: "all" },
      { label: "Planificado", value: ENROLLMENT_PERIOD_STATUS.PLANNED },
      { label: "Abierto", value: ENROLLMENT_PERIOD_STATUS.OPEN },
      { label: "Cerrado", value: ENROLLMENT_PERIOD_STATUS.CLOSED },
    ],
    value: status ?? "all",
  };

  const advancedFilterCount = selectedAcademicYear ? 1 : 0;
  const hasFilters = search.length > 0 || status !== undefined || selectedAcademicYear != null;

  const { isChangingStatus, handleStatusChange } = useEnrollmentPeriodStatus(institutionId, scope);

  function renderCreateAction(): ReactNode {
    if (!canCreate) {
      return null;
    }

    const createHref = AcademicScope.isAdmin(scope)
      ? `/admin/enrollment-periods/new?institutionId=${encodeURIComponent(institutionId)}`
      : "/enrollment-periods/new";

    return (
      <Button asChild size="lg" className="w-full">
        <ReturnToLink href={createHref}>
          <PlusIcon data-icon="inline-start" />
          Nuevo período
        </ReturnToLink>
      </Button>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <PlatformCollectionActions className={canCreate ? "sm:justify-between" : undefined}>
        {renderCreateAction()}
        <DataTableAdvancedFiltersTrigger count={advancedFilterCount} label="Filtros avanzados" />
      </PlatformCollectionActions>

      <EnrollmentPeriodTableFilters
        advancedFilterCount={advancedFilterCount}
        selectedAcademicYear={selectedAcademicYear}
        fetchAcademicYears={fetchAcademicYears}
        scope={scope}
        institutionId={institutionId}
        navigate={navigate}
        data={data}
        isNavigating={isNavigating}
        search={search}
        statusFilter={statusFilter}
        institutionName={institutionName}
      />

      {data.items.length === 0 ? (
        <div className="relative min-h-0 flex-1" aria-busy={isNavigating}>
          <EnrollmentPeriodEmptyState
            createAction={renderCreateAction()}
            hasFilters={hasFilters}
            hasItemsOnOtherPages={data.totalItems > 0}
            onFirstPage={() => navigate({ page: "0", size: String(data.size) })}
          />
          {isNavigating ? (
            <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
              <Loader2Icon className="text-muted-foreground size-5 animate-spin" aria-label="Cargando períodos de inscripción" role="status" />
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border" aria-busy={isNavigating}>
            <EnrollmentPeriodResultsTable
              data={data}
              scope={scope}
              institutionId={institutionId}
              canChangeStatus={canChangeStatus}
              canDelete={canDelete}
              canUpdate={canUpdate}
              isChangingStatus={isChangingStatus}
              handleStatusChange={handleStatusChange}
              setDeletingPeriodId={setDeletingPeriodId}
            />

            {isNavigating ? (
              <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px]">
                <Loader2Icon className="text-muted-foreground size-5 animate-spin" aria-label="Cargando períodos de inscripción" role="status" />
              </div>
            ) : null}
          </div>

          <DataTablePagination
            page={data.page}
            size={data.size}
            totalPages={data.totalPages}
            summaryLabel={data.totalItems === 1 ? "1 período de inscripción." : `${data.totalItems} períodos de inscripción.`}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            isPending={isNavigating}
            onPageChange={(page) => navigate({ page: String(page), size: String(data.size) })}
            onPageSizeChange={(size) => navigate({ size, page: "0" })}
          />
        </>
      )}

      {deletingPeriodId && (
        <EnrollmentPeriodDeleteDialog
          institutionId={institutionId}
          periodId={deletingPeriodId}
          scope={scope}
          onClose={() => setDeletingPeriodId(null)}
        />
      )}
    </div>
  );
}
