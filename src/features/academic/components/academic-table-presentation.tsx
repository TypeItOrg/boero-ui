"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { GraduationCapIcon, Loader2Icon, PlusIcon, SearchIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Button } from "@common/components/ui/button";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTableSortableHead } from "@common/components/ui/data-table-sortable-head";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { PaginationParams } from "@common/types/pagination-params.types";
import { AcademicTablePagination } from "@features/academic/components/academic-table-pagination";
import { ActiveAcademicStatusDialog } from "@features/academic/components/active-academic-status-dialog";
import { AcademicDeleteDialog } from "@features/academic/components/academic-delete-dialog";
import { AcademicRestoreDialog } from "@features/academic/components/academic-restore-dialog";
import { AcademicTableRow } from "@features/academic/components/academic-table-row";
import { AcademicYearStatusDialog } from "@features/academic/components/academic-year-status-dialog";
import { StudyPlanStatusDialog } from "@features/academic/components/study-plan-status-dialog";
import type {
  AcademicTableColumns,
  AcademicTableRow as AcademicTableRowData,
} from "@features/academic/config/academic-collection.config";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { AcademicStatusSelection } from "@features/academic/types/academic-status-selection.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import type { AcademicSort, AcademicSortField } from "@features/academic/utils/academic-pagination.util";

type AcademicTablePresentationProps = PaginationParams & {
  basePath: string;
  canCreate: boolean;
  canDelete: boolean;
  canRestore: boolean;
  canChangeStatus: boolean;
  columns: AcademicTableColumns;
  data: PaginatedResponse<AcademicTableRowData>;
  deleted: boolean;
  hasFilters: boolean;
  institutionId: string;
  canUpdate: boolean;
  plural: string;
  resource: AcademicCollectionResource;
  scope: AcademicScope;
  singular: string;
  sort: AcademicSort;
};

export function AcademicTablePresentation({
  basePath,
  canCreate,
  canDelete,
  canRestore,
  canChangeStatus,
  columns,
  data,
  deleted,
  hasFilters,
  institutionId,
  canUpdate,
  page,
  plural,
  resource,
  scope,
  singular,
  sort,
  size,
}: AcademicTablePresentationProps): React.ReactElement {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isPending, navigate } = useDataTableNavigation();
  const [statusAction, setStatusAction] = React.useState<AcademicStatusSelection>();
  const [lifecycleAction, setLifecycleAction] = React.useState<{
    id: string;
    kind: "delete" | "restore";
    label: string;
  }>();
  const returnTo = getCurrentPath(pathname, searchParams.toString());
  const lifecycleRow = lifecycleAction ? data.items.find((row) => row.id === lifecycleAction.id) : undefined;
  const showDeleteDialog = lifecycleAction?.kind === "delete" && lifecycleRow?.deletedAt == null;
  const showRestoreDialog = lifecycleAction?.kind === "restore" && lifecycleRow?.deletedAt != null;

  function updateSort(nextSort: AcademicSort): void {
    navigate({ page: "0", sortField: nextSort.field, sortDirection: nextSort.direction });
  }

  if (data.items.length === 0) {
    const isInitialEmptyState = !hasFilters && data.totalItems === 0;
    const allowCreate = canCreate && !deleted;

    return (
      <div className="relative h-full" aria-busy={isPending}>
        <EmptyState
          hasFilters={hasFilters}
          hasItemsOnOtherPages={data.totalItems > 0}
          showingDeleted={deleted}
          onFirstPage={() => navigate({ page: "0", size: String(size) })}
          supportingDescription={
            isInitialEmptyState ? getEmptyStateSupportingDescription(resource, singular) : undefined
          }
          createAction={
            allowCreate ? (
              <Button asChild size="lg" className="mt-6">
                <ReturnToLink href={`${basePath}/${resource}/new`}>
                  <PlusIcon data-icon="inline-start" />
                  {`Nuevo ${singular}`}
                </ReturnToLink>
              </Button>
            ) : null
          }
        />
        {isPending ? <LoadingOverlay /> : null}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative h-full overflow-hidden rounded-lg border" aria-busy={isPending}>
        <Table
          containerClassName="table-scrollbar"
          className={columns.detailLabels.length > 1 ? "min-w-220" : "min-w-180"}
        >
          <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
            <TableRow>
              {[columns.primaryLabel, ...columns.detailLabels].map((label, index) => {
                const field = columns.sortableFields?.[index];
                if (field) {
                  return (
                    <DataTableSortableHead<AcademicSortField>
                      key={`${label}-${index}`}
                      field={field}
                      label={label}
                      sort={sort}
                      onSortChange={updateSort}
                    />
                  );
                }

                return <TableHead key={`${label}-${index}`}>{label}</TableHead>;
              })}
              <TableHead>Estado</TableHead>
              <TableHead className="w-16 pr-4">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((row) => (
              <AcademicTableRow
                key={row.id}
                basePath={basePath}
                canChangeStatus={canChangeStatus}
                canDelete={canDelete}
                canRestore={canRestore}
                canUpdate={canUpdate}
                columns={columns}
                onLifecycleAction={(id, label, kind) => setLifecycleAction({ id, kind, label })}
                onStatusAction={setStatusAction}
                resource={resource}
                row={row}
              />
            ))}
          </TableBody>
        </Table>
        {isPending ? <LoadingOverlay /> : null}
      </div>
      <AcademicTablePagination
        page={page}
        size={size}
        singular={singular}
        plural={plural}
        totalItems={data.totalItems}
        totalPages={data.totalPages}
        isPending={isPending}
        onPageChange={(nextPage) => navigate({ page: String(nextPage), size: String(size) })}
        onPageSizeChange={(nextSize) => navigate({ page: "0", size: nextSize })}
      />
      {statusAction ? (
        <AcademicStatusDialog
          institutionId={institutionId}
          onOpenChange={(open) => {
            if (!open) setStatusAction(undefined);
          }}
          returnTo={returnTo}
          scope={scope}
          selection={statusAction}
        />
      ) : null}
      {showDeleteDialog ? (
        <AcademicDeleteDialog
          destination={returnTo}
          id={lifecycleAction.id}
          institutionId={institutionId}
          label={`${singular} ${lifecycleAction.label}`}
          onOpenChange={(open) => {
            if (!open) setLifecycleAction(undefined);
          }}
          open
          resource={resource}
          scope={scope}
        />
      ) : null}
      {showRestoreDialog ? (
        <AcademicRestoreDialog
          destination={returnTo}
          id={lifecycleAction.id}
          institutionId={institutionId}
          label={`${singular} ${lifecycleAction.label}`}
          onOpenChange={(open) => {
            if (!open) setLifecycleAction(undefined);
          }}
          open
          resource={resource}
          scope={scope}
        />
      ) : null}
    </div>
  );
}

type AcademicStatusDialogProps = {
  institutionId: string;
  onOpenChange: (open: boolean) => void;
  returnTo: string;
  scope: AcademicScope;
  selection: AcademicStatusSelection;
};

function AcademicStatusDialog({
  institutionId,
  onOpenChange,
  returnTo,
  scope,
  selection,
}: AcademicStatusDialogProps): React.ReactElement {
  if (selection.resource === AcademicResource.ACADEMIC_YEAR) {
    return (
      <AcademicYearStatusDialog
        academicYearLabel={selection.academicYearLabel}
        id={selection.id}
        institutionId={institutionId}
        onOpenChange={onOpenChange}
        open
        returnTo={returnTo}
        scope={scope}
        targetStatus={selection.targetStatus}
      />
    );
  }

  if (selection.resource === AcademicResource.STUDY_PLAN) {
    return (
      <StudyPlanStatusDialog
        key={`${selection.id}-${selection.targetStatus}`}
        effectiveFrom={selection.effectiveFrom}
        id={selection.id}
        institutionId={institutionId}
        onOpenChange={onOpenChange}
        open
        returnTo={returnTo}
        scope={scope}
        studyPlanLabel={selection.studyPlanLabel}
        targetStatus={selection.targetStatus}
      />
    );
  }

  return (
    <ActiveAcademicStatusDialog
      id={selection.id}
      institutionId={institutionId}
      onOpenChange={onOpenChange}
      open
      resource={selection.resource}
      resourceLabel={selection.resourceLabel}
      returnTo={returnTo}
      scope={scope}
      targetStatus={selection.targetStatus}
    />
  );
}

function getCurrentPath(pathname: string, queryString: string): string {
  return queryString ? `${pathname}?${queryString}` : pathname;
}

function LoadingOverlay(): React.ReactElement {
  return (
    <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px]">
      <Loader2Icon
        className="text-muted-foreground size-5 animate-spin"
        aria-label="Cargando información académica"
        role="status"
      />
    </div>
  );
}

function EmptyState({
  createAction,
  hasFilters,
  hasItemsOnOtherPages,
  onFirstPage,
  showingDeleted,
  supportingDescription,
}: {
  createAction: React.ReactNode;
  hasFilters: boolean;
  hasItemsOnOtherPages: boolean;
  onFirstPage: () => void;
  showingDeleted: boolean;
  supportingDescription?: string;
}): React.ReactElement {
  const Icon = hasFilters ? SearchIcon : GraduationCapIcon;
  const copy = getEmptyStateCopy(hasFilters, hasItemsOnOtherPages, showingDeleted);
  const description = supportingDescription ?? copy.description;

  return (
    <div className="bg-muted/25 text-muted-foreground flex h-full min-h-80 flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
      <div className="bg-background text-primary mb-5 flex size-14 items-center justify-center rounded-full border shadow-xs">
        <Icon className="size-7" aria-hidden="true" />
      </div>
      <h3 className="text-foreground font-heading text-lg font-medium tracking-tight">{copy.title}</h3>
      <p className="text-muted-foreground [&>a:hover]:text-primary mt-2 max-w-md text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4">
        {description}
      </p>
      {createAction}
      {hasItemsOnOtherPages ? (
        <Button type="button" variant="outline" size="sm" className="mt-6" onClick={onFirstPage}>
          Volver a la primera página
        </Button>
      ) : null}
    </div>
  );
}

function getEmptyStateCopy(
  hasFilters: boolean,
  hasItemsOnOtherPages: boolean,
  showingDeleted: boolean,
): { title: string; description: string } {
  if (hasItemsOnOtherPages) {
    return {
      title: "No hay elementos en esta página",
      description: "Volvé a la primera página para ver los resultados.",
    };
  }
  if (hasFilters) {
    if (showingDeleted) {
      return {
        title: "No hay registros eliminados",
        description:
          "No hay registros eliminados para mostrar. Esta vista separa los registros eliminados de los vigentes.",
      };
    }
    return {
      title: "No se encontraron resultados",
      description: "No encontramos elementos que coincidan con los filtros.",
    };
  }
  return {
    title: "No hay registros académicos",
    description: "Todavía no se registraron elementos en esta sección.",
  };
}

function getEmptyStateSupportingDescription(resource: AcademicCollectionResource, singular: string): string {
  switch (resource) {
    case AcademicResource.ACADEMIC_YEAR:
      return "Creá un ciclo lectivo para definir el calendario y organizar las fechas académicas de la institución.";
    case AcademicResource.TRAINING_PATH:
      return "Creá un trayecto formativo para organizar carreras, orientaciones y recorridos académicos.";
    case AcademicResource.STUDY_PLAN:
      return "Creá tu primer plan de estudio para organizar la estructura curricular, definir su vigencia y asociarlo a un trayecto formativo.";
    case AcademicResource.ACADEMIC_SPACE:
      return "Creá un espacio académico para construir el catálogo de asignaturas, talleres y seminarios.";
    case AcademicResource.INSTRUMENT:
      return "Agregá instrumentos al catálogo institucional para mantenerlos disponibles en tus propuestas académicas.";
    default:
      return `Creá tu primer ${singular} para comenzar a organizar la información académica.`;
  }
}
