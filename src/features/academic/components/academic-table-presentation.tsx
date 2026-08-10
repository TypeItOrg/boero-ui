"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { GraduationCapIcon, Loader2Icon, SearchIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTableSortableHead } from "@common/components/ui/data-table-sortable-head";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { PaginationParams } from "@common/types/pagination-params.types";
import { AcademicTablePagination } from "@features/academic/components/academic-table-pagination";
import { AcademicTableRow } from "@features/academic/components/academic-table-row";
import { AcademicYearStatusDialog } from "@features/academic/components/academic-year-status-dialog";
import { StudyPlanStatusDialog } from "@features/academic/components/study-plan-status-dialog";
import { TrainingPathStatusDialog } from "@features/academic/components/training-path-status-dialog";
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
  canChangeStatus: boolean;
  columns: AcademicTableColumns;
  data: PaginatedResponse<AcademicTableRowData>;
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
  canChangeStatus,
  columns,
  data,
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
  const returnTo = getCurrentPath(pathname, searchParams.toString());

  function updateSort(nextSort: AcademicSort): void {
    navigate({ page: "0", sortField: nextSort.field, sortDirection: nextSort.direction });
  }

  if (data.items.length === 0) {
    return (
      <div className="relative h-full" aria-busy={isPending}>
        <EmptyState
          hasFilters={hasFilters}
          hasItemsOnOtherPages={data.totalItems > 0}
          onFirstPage={() => navigate({ page: "0", size: String(size) })}
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
                canUpdate={canUpdate}
                columns={columns}
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

  if (selection.resource === AcademicResource.TRAINING_PATH) {
    return (
      <TrainingPathStatusDialog
        id={selection.id}
        institutionId={institutionId}
        onOpenChange={onOpenChange}
        open
        returnTo={returnTo}
        scope={scope}
        targetStatus={selection.targetStatus}
        trainingPathLabel={selection.trainingPathLabel}
      />
    );
  }

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
  hasFilters,
  hasItemsOnOtherPages,
  onFirstPage,
}: {
  hasFilters: boolean;
  hasItemsOnOtherPages: boolean;
  onFirstPage: () => void;
}): React.ReactElement {
  const Icon = hasFilters ? SearchIcon : GraduationCapIcon;
  const copy = getEmptyStateCopy(hasFilters, hasItemsOnOtherPages);

  return (
    <div className="bg-muted/25 text-muted-foreground flex h-full min-h-72 flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
      <Icon className="mb-4 size-8" />
      <h3 className="text-foreground text-base font-semibold">{copy.title}</h3>
      <p className="mt-1.5 max-w-sm text-sm">{copy.description}</p>
      {hasItemsOnOtherPages ? (
        <Button type="button" variant="outline" size="sm" className="mt-6" onClick={onFirstPage}>
          Volver a la primera página
        </Button>
      ) : null}
    </div>
  );
}

function getEmptyStateCopy(hasFilters: boolean, hasItemsOnOtherPages: boolean): { title: string; description: string } {
  if (hasItemsOnOtherPages) {
    return {
      title: "No hay elementos en esta página",
      description: "Volvé a la primera página para ver los resultados.",
    };
  }
  if (hasFilters) {
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
