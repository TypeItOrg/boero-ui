"use client";

import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import { startTransition, useActionState, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { EllipsisVerticalIcon, Loader2Icon, PlusIcon } from "lucide-react";
import { Button } from "@common/components/ui/button";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { toast } from "sonner";
import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { DataTableAdvancedFiltersTrigger } from "@common/components/ui/data-table-advanced-filters-trigger";
import { DataTableFilters, type DataTableSelectFilter } from "@common/components/ui/data-table-filters";
import { DataTableNavigationProvider, useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import { PAGE_SIZE_OPTIONS } from "@common/utils/pagination-query.util";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import { fetchAcademicOptionPage } from "@features/academic/services/academic-options.service";
import { fetchPlatformInstitutionOptions } from "@features/institutions/services/fetch-platform-institution-options.service";
import type { InstitutionSummary } from "@features/institutions/types/institution-summary.types";
import { Badge } from "@common/components/ui/badge";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@common/components/ui/context-menu";
import { Sheet } from "@common/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { AcademicYear } from "@features/academic/types/academic-year.types";
import type { EnrollmentPeriod } from "@features/enrollment-periods/types/enrollment-period.types";
import { ENROLLMENT_PERIOD_STATUS, type EnrollmentPeriodStatus } from "@features/enrollment-periods/types/enrollment-period-status.types";
import { updateEnrollmentPeriodStatusAction } from "@features/enrollment-periods/actions/enrollment-period.actions";
import { EnrollmentPeriodDeleteDialog } from "@features/enrollment-periods/components/enrollment-period-delete-dialog";
import { EnrollmentPeriodEmptyState } from "@features/enrollment-periods/components/enrollment-period-empty-state";
import type { EnrollmentPeriodActionState } from "@features/enrollment-periods/types/enrollment-period-action-state.types";
import { PlatformCollectionActions } from "@features/platform-auth/components/platform-collection-actions";
import { formatEnrollmentPeriodDateTime } from "@features/enrollment-periods/utils/enrollment-period-date.util";

interface Props {
  institutionId: string;
  data: PaginatedResponse<EnrollmentPeriod>;
  selectedAcademicYear?: AcademicYear | null;
  institutionName?: string;
  search: string;
  status?: EnrollmentPeriodStatus;
  canCreate: boolean;
  canUpdate: boolean;
  canChangeStatus: boolean;
  canDelete: boolean;
  scope?: AcademicScope;
}

const statusBadges: Record<EnrollmentPeriodStatus, { label: string; variant: "outline" | "default" | "secondary" | "destructive" }> = {
  [ENROLLMENT_PERIOD_STATUS.PLANNED]: { label: "Planificado", variant: "secondary" },
  [ENROLLMENT_PERIOD_STATUS.OPEN]: { label: "Abierto", variant: "default" },
  [ENROLLMENT_PERIOD_STATUS.CLOSED]: { label: "Cerrado", variant: "destructive" },
};

export function EnrollmentPeriodsTable(props: Props) {
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
}: Props) {
  const router = useRouter();
  const { isPending: isNavigating, navigate } = useDataTableNavigation();
  const fetchAcademicYears = useCallback(
    (input: AsyncDropdownFetchPageInput) => fetchAcademicOptionPage<AcademicYear>("academic-years", scope, institutionId, input, { active: "all" }),
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

  const [, changeStatus, isChangingStatus] = useActionState(
    async (_previous: EnrollmentPeriodActionState, input: { periodId: string; status: EnrollmentPeriodStatus }) => {
      const result = await updateEnrollmentPeriodStatusAction(institutionId, input.periodId, { status: input.status }, scope);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(ENROLLMENT_MESSAGES.PERIOD_STATUS_UPDATED);
        router.refresh();
      }

      return result;
    },
    {},
  );

  const handleStatusChange = (periodId: string, status: EnrollmentPeriodStatus) => startTransition(() => changeStatus({ periodId, status }));

  function renderCreateAction(): React.ReactNode {
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
                  navigate({ institutionId: value, academicYearId: undefined, page: "0", size: String(data.size) }, { replace: true });
                }
              }}
              placeholder="Seleccionar institución"
              searchPlaceholder="Buscar institución…"
              disabled={isNavigating}
            />
          </div>
        ) : null}
      </DataTableFilters>

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
            <Table containerClassName="table-scrollbar h-full" className="min-w-225">
              <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
                <TableRow className="hover:bg-muted/50 data-[state=selected]:bg-muted h-11 border-b transition-colors">
                  <TableHead>Nombre</TableHead>
                  <TableHead>Ciclo lectivo</TableHead>
                  <TableHead>Fecha de inicio</TableHead>
                  <TableHead>Fecha de fin</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-16 pr-4">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((period) => {
                  const statusInfo = statusBadges[period.status];
                  const editHref = AcademicScope.isAdmin(scope)
                    ? `/admin/enrollment-periods/${period.id}/edit?institutionId=${encodeURIComponent(institutionId)}`
                    : `/enrollment-periods/${period.id}/edit`;

                  return (
                    <ContextMenu key={period.id}>
                      <ContextMenuTrigger asChild>
                        <TableRow>
                          <TableCell className="font-medium">{period.name}</TableCell>
                          <TableCell>Ciclo {period.academicYearNumber}</TableCell>
                          <TableCell>{formatEnrollmentPeriodDateTime(period.startDate)}</TableCell>
                          <TableCell>{formatEnrollmentPeriodDateTime(period.endDate)}</TableCell>
                          <TableCell>
                            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                          </TableCell>
                          <TableCell className="pr-4">
                            <div className="flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" aria-label={`Abrir acciones de ${period.name}`} disabled={isChangingStatus}>
                                    <EllipsisVerticalIcon />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44 p-1.5">
                                  {canUpdate ? (
                                    <DropdownMenuItem asChild>
                                      <ReturnToLink href={editHref} className="px-2.5 py-1.5">
                                        Editar
                                      </ReturnToLink>
                                    </DropdownMenuItem>
                                  ) : null}
                                  {canChangeStatus && period.status !== ENROLLMENT_PERIOD_STATUS.OPEN ? (
                                    <DropdownMenuItem
                                      className="px-2.5 py-1.5"
                                      onSelect={() => handleStatusChange(period.id, ENROLLMENT_PERIOD_STATUS.OPEN)}
                                    >
                                      Abrir inscripciones
                                    </DropdownMenuItem>
                                  ) : null}
                                  {canChangeStatus && period.status !== ENROLLMENT_PERIOD_STATUS.CLOSED ? (
                                    <DropdownMenuItem
                                      variant="destructive"
                                      className="px-2.5 py-1.5"
                                      onSelect={() => handleStatusChange(period.id, ENROLLMENT_PERIOD_STATUS.CLOSED)}
                                    >
                                      Cerrar inscripciones
                                    </DropdownMenuItem>
                                  ) : null}
                                  {canDelete ? (
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive px-2.5 py-1.5"
                                      onSelect={() => setDeletingPeriodId(period.id)}
                                    >
                                      Eliminar
                                    </DropdownMenuItem>
                                  ) : null}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-44 p-1.5">
                        {canUpdate ? (
                          <ContextMenuItem asChild disabled={isChangingStatus}>
                            <ReturnToLink href={editHref} className="px-2.5 py-1.5">
                              Editar
                            </ReturnToLink>
                          </ContextMenuItem>
                        ) : null}
                        {canChangeStatus && period.status !== ENROLLMENT_PERIOD_STATUS.OPEN ? (
                          <ContextMenuItem
                            className="px-2.5 py-1.5"
                            disabled={isChangingStatus}
                            onSelect={() => handleStatusChange(period.id, ENROLLMENT_PERIOD_STATUS.OPEN)}
                          >
                            Abrir inscripciones
                          </ContextMenuItem>
                        ) : null}
                        {canChangeStatus && period.status !== ENROLLMENT_PERIOD_STATUS.CLOSED ? (
                          <ContextMenuItem
                            variant="destructive"
                            className="px-2.5 py-1.5"
                            disabled={isChangingStatus}
                            onSelect={() => handleStatusChange(period.id, ENROLLMENT_PERIOD_STATUS.CLOSED)}
                          >
                            Cerrar inscripciones
                          </ContextMenuItem>
                        ) : null}
                        {canDelete ? (
                          <ContextMenuItem
                            className="text-destructive focus:text-destructive px-2.5 py-1.5"
                            disabled={isChangingStatus}
                            onSelect={() => setDeletingPeriodId(period.id)}
                          >
                            Eliminar
                          </ContextMenuItem>
                        ) : null}
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                })}
              </TableBody>
            </Table>

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
