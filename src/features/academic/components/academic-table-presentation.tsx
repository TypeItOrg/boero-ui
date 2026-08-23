"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2Icon, PlusIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Button } from "@common/components/ui/button";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTableSortableHead } from "@common/components/ui/data-table-sortable-head";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { PaginationParams } from "@common/types/pagination-params.types";
import { AcademicDeleteDialog } from "@features/academic/components/academic-delete-dialog";
import { AcademicRestoreDialog } from "@features/academic/components/academic-restore-dialog";
import { AcademicStatusDialogRouter } from "@features/academic/components/academic-status-dialog-router";
import { AcademicTableEmptyState, getEmptyStateSupportingDescription } from "@features/academic/components/academic-table-empty-state";
import { AcademicTablePagination } from "@features/academic/components/academic-table-pagination";
import { AcademicTableRow } from "@features/academic/components/academic-table-row";
import { ACADEMIC_LIFECYCLE_ACTION_KIND, type AcademicLifecycleActionKind } from "@features/academic/types/academic-lifecycle-action-kind.types";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import type { AcademicStatusSelection } from "@features/academic/types/academic-status-selection.types";
import type { AcademicTableColumns } from "@features/academic/types/academic-table-columns.types";
import type { AcademicTableRow as AcademicTableRowData } from "@features/academic/types/academic-table-row.types";
import type { AcademicSort, AcademicSortField } from "@features/academic/utils/academic-pagination.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type AcademicTablePresentationProps = PaginationParams & {
  basePath: string;
  canCreate: boolean;
  canDelete: boolean;
  canRestore: boolean;
  canChangeStatus: boolean;
  columns: AcademicTableColumns;
  createAction?: React.ReactNode;
  data: PaginatedResponse<AcademicTableRowData>;
  deleted: boolean;
  hasFilters: boolean;
  global?: boolean;
  institutionId?: string;
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
  createAction,
  data,
  deleted,
  hasFilters,
  global = false,
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
  const [statusAction, setStatusAction] = React.useState<{ institutionId: string; selection: AcademicStatusSelection }>();
  const [lifecycleAction, setLifecycleAction] = React.useState<{
    id: string;
    kind: AcademicLifecycleActionKind;
    label: string;
    institutionId: string;
  }>();
  const returnTo = getCurrentPath(pathname, searchParams.toString());
  const lifecycleRow = lifecycleAction ? data.items.find((row) => row.id === lifecycleAction.id) : undefined;
  const showDeleteDialog = lifecycleAction?.kind === ACADEMIC_LIFECYCLE_ACTION_KIND.DELETE && lifecycleRow?.deletedAt == null;
  const showRestoreDialog = lifecycleAction?.kind === ACADEMIC_LIFECYCLE_ACTION_KIND.RESTORE && lifecycleRow?.deletedAt != null;

  function updateSort(nextSort: AcademicSort): void {
    navigate({ page: "0", sortField: nextSort.field, sortDirection: nextSort.direction });
  }

  function getInstitutionId(rowId: string): string {
    return data.items.find((row) => row.id === rowId)?.institutionId ?? institutionId ?? "";
  }

  if (data.items.length === 0) {
    const isInitialEmptyState = !hasFilters && data.totalItems === 0;
    const allowCreate = !deleted && (canCreate || createAction !== undefined);

    return (
      <div className="relative h-full" aria-busy={isPending}>
        <AcademicTableEmptyState
          hasFilters={hasFilters}
          hasItemsOnOtherPages={data.totalItems > 0}
          showingDeleted={deleted}
          onFirstPage={() => navigate({ page: "0", size: String(size) })}
          supportingDescription={isInitialEmptyState ? getEmptyStateSupportingDescription(resource, singular) : undefined}
          createAction={
            allowCreate && createAction ? (
              <div className="mt-6">{createAction}</div>
            ) : allowCreate ? (
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
        <Table containerClassName="table-scrollbar" className={columns.detailLabels.length > 1 ? "min-w-220" : "min-w-180"}>
          <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
            <TableRow>
              {global ? <TableHead>Institución</TableHead> : null}
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
                basePath={global ? `/admin/institutions/${row.institutionId}/academic` : basePath}
                canChangeStatus={canChangeStatus}
                canDelete={canDelete}
                canRestore={canRestore}
                canUpdate={canUpdate}
                columns={columns}
                global={global}
                onLifecycleAction={(id, label, kind) => {
                  setLifecycleAction({ id, institutionId: getInstitutionId(id), kind, label });
                }}
                onStatusAction={(selection) => {
                  setStatusAction({ institutionId: getInstitutionId(selection.id), selection });
                }}
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
        <AcademicStatusDialogRouter
          institutionId={statusAction.institutionId}
          onOpenChange={(open) => {
            if (!open) setStatusAction(undefined);
          }}
          returnTo={returnTo}
          scope={scope}
          selection={statusAction.selection}
        />
      ) : null}
      {showDeleteDialog ? (
        <AcademicDeleteDialog
          destination={returnTo}
          id={lifecycleAction.id}
          institutionId={lifecycleAction.institutionId}
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
          institutionId={lifecycleAction.institutionId}
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

function getCurrentPath(pathname: string, queryString: string): string {
  return queryString ? `${pathname}?${queryString}` : pathname;
}

function LoadingOverlay(): React.ReactElement {
  return (
    <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px]">
      <Loader2Icon className="text-muted-foreground size-5 animate-spin" aria-label="Cargando información académica" role="status" />
    </div>
  );
}
