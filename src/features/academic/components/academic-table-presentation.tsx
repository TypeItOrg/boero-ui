"use client";

import { useState, type ReactElement } from "react";

import { usePathname, useSearchParams } from "next/navigation";

import { PlusIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Button } from "@common/components/ui/button";
import { DataTableLoadingOverlay } from "@common/components/ui/data-table-loading-overlay";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";

import { AcademicDeleteDialog } from "@features/academic/components/academic-delete-dialog";
import { AcademicRestoreDialog } from "@features/academic/components/academic-restore-dialog";
import { AcademicResultsTable } from "@features/academic/components/academic-results-table";
import { AcademicStatusDialogRouter } from "@features/academic/components/academic-status-dialog-router";
import { AcademicTableEmptyState, getEmptyStateSupportingDescription } from "@features/academic/components/academic-table-empty-state";
import { AcademicTablePagination } from "@features/academic/components/academic-table-pagination";
import { ACADEMIC_LIFECYCLE_ACTION_KIND, type AcademicLifecycleActionKind } from "@features/academic/types/academic-lifecycle-action-kind.types";
import type { AcademicStatusSelection } from "@features/academic/types/academic-status-selection.types";
import { type AcademicTablePresentationProps } from "@features/academic/types/academic-table-presentation-props.types";
import type { AcademicSort } from "@features/academic/utils/academic-pagination.util";

export function AcademicTablePresentation({
  basePath,
  canCreate,
  canReadWaitlist = false,
  canCreateVersion = false,
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
}: AcademicTablePresentationProps): ReactElement {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isPending, navigate } = useDataTableNavigation();

  const [statusAction, setStatusAction] = useState<{
    institutionId: string;
    selection: AcademicStatusSelection;
  }>();

  const [lifecycleAction, setLifecycleAction] = useState<{
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
    const allowCreate = !deleted && (canCreate || createAction !== undefined);
    const isInitialEmptyState = !hasFilters && !deleted && data.totalItems === 0 && allowCreate;

    return (
      <div className="relative h-full" aria-busy={isPending}>
        <AcademicTableEmptyState
          plural={plural}
          hasFilters={hasFilters}
          hasItemsOnOtherPages={data.totalItems > 0}
          showingDeleted={deleted}
          onFirstPage={() => navigate({ page: "0", size: String(size) })}
          supportingDescription={isInitialEmptyState ? getEmptyStateSupportingDescription(resource, singular) : undefined}
          createAction={
            allowCreate && createAction ? (
              <div>{createAction}</div>
            ) : allowCreate ? (
              <Button asChild size="lg">
                <ReturnToLink href={`${basePath}/${resource}/new`}>
                  <PlusIcon data-icon="inline-start" />
                  {`Nuevo ${singular}`}
                </ReturnToLink>
              </Button>
            ) : null
          }
        />
        {isPending ? <DataTableLoadingOverlay label="Cargando información académica" /> : null}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative h-full overflow-hidden rounded-lg border" aria-busy={isPending}>
        <AcademicResultsTable
          columns={columns}
          global={global}
          sort={sort}
          updateSort={updateSort}
          data={data}
          basePath={basePath}
          canChangeStatus={canChangeStatus}
          canDelete={canDelete}
          canCreateVersion={canCreateVersion}
          canReadWaitlist={canReadWaitlist}
          canRestore={canRestore}
          canUpdate={canUpdate}
          setLifecycleAction={setLifecycleAction}
          getInstitutionId={getInstitutionId}
          setStatusAction={setStatusAction}
          resource={resource}
        />
        {isPending ? <DataTableLoadingOverlay label="Cargando información académica" /> : null}
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
            if (!open) {
              setStatusAction(undefined);
            }
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
            if (!open) {
              setLifecycleAction(undefined);
            }
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
            if (!open) {
              setLifecycleAction(undefined);
            }
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
