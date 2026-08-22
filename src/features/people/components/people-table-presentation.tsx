"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";

import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTableSortableHead } from "@common/components/ui/data-table-sortable-head";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { PaginationQuery } from "@common/types/pagination-query.types";
import { PeopleTableEmptyState } from "@features/people/components/people-table-empty-state";
import { PeopleTableRow } from "@features/people/components/people-table-row";
import type { PersonSummary } from "@features/people/types/person-summary.types";
import type { PeopleSort, PeopleSortField } from "@features/people/utils/people-pagination.util";
import { PeopleScope, type PeopleScope as PeopleScopeType } from "@features/people/utils/people-scope.util";
import { PeoplePagination } from "@features/people/components/people-pagination";
import { PersonDeleteDialog } from "@features/people/components/person-delete-dialog";
import { PersonStatusDialog } from "@features/people/components/person-status-dialog";

type PeopleTablePresentationProps = PaginationQuery & {
  data: PaginatedResponse<PersonSummary>;
  institutionId: string;
  sort: PeopleSort;
  scope?: PeopleScopeType;
  selfPersonId?: string | null;
  canCreate?: boolean;
  canUpdate?: boolean;
  canManageRoles?: boolean;
  canDelete?: boolean;
  canUpdateStatus?: boolean;
};

export function PeopleTablePresentation({
  data,
  institutionId,
  page,
  size,
  search,
  sort,
  scope = PeopleScope.ADMIN,
  selfPersonId,
  canCreate = true,
  canUpdate = true,
  canManageRoles = false,
  canDelete = true,
  canUpdateStatus = false,
}: PeopleTablePresentationProps): React.ReactElement {
  const router = useRouter();
  const { isPending: isNavigating, navigate } = useDataTableNavigation();
  const [personToDelete, setPersonToDelete] = React.useState<PersonSummary>();
  const [personToUpdateStatus, setPersonToUpdateStatus] = React.useState<PersonSummary>();

  function handleDeleteDialogOpenChange(open: boolean): void {
    if (!open) setPersonToDelete(undefined);
  }

  function handlePersonDeleted(): void {
    setPersonToDelete(undefined);
    router.refresh();
  }

  function handleStatusDialogOpenChange(open: boolean): void {
    if (!open) setPersonToUpdateStatus(undefined);
  }

  function handleStatusUpdated(): void {
    setPersonToUpdateStatus(undefined);
    router.refresh();
  }

  function updateSort(nextSort: PeopleSort): void {
    navigate({ page: "0", sortField: nextSort.field, sortDirection: nextSort.direction });
  }

  if (data.items.length === 0) {
    return (
      <PeopleTableEmptyState
                canCreate={canCreate}
        institutionId={institutionId}
        isNavigating={isNavigating}
        scope={scope}
        search={search}
        size={size}
        totalItems={data.totalItems}
      />
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative h-full overflow-hidden rounded-lg border" aria-busy={isNavigating}>
        <Table containerClassName="table-scrollbar" className="min-w-190">
          <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
            <TableRow className="hover:bg-muted/50 data-[state=selected]:bg-muted h-11 border-b transition-colors">
              <DataTableSortableHead<PeopleSortField> field="lastName" label="Nombre" sort={sort} onSortChange={updateSort} />
              <DataTableSortableHead<PeopleSortField> field="documentNumber" label="Documento" sort={sort} onSortChange={updateSort} />
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              {PeopleScope.isInstitutional(scope) ? <TableHead>Estado</TableHead> : null}
              <TableHead>Rol</TableHead>
              <TableHead className="w-16">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((person) => (
              <PeopleTableRow
                key={person.id}
                canDelete={canDelete}
                canManageRoles={canManageRoles}
                canUpdate={canUpdate}
                canUpdateStatus={canUpdateStatus}
                institutionId={institutionId}
                onDelete={setPersonToDelete}
                onUpdateStatus={setPersonToUpdateStatus}
                person={person}
                scope={scope}
                selfPersonId={selfPersonId}
              />
            ))}
          </TableBody>
        </Table>

        {isNavigating && (
          <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px]">
            <Loader2Icon className="text-muted-foreground size-5 animate-spin" aria-label="Cargando usuarios" role="status" />
          </div>
        )}
      </div>

      <PeoplePagination page={page} size={size} totalItems={data.totalItems} totalPages={data.totalPages} />

      {personToDelete ? (
        <PersonDeleteDialog
          institutionId={institutionId}
          scope={scope}
          personId={personToDelete.id}
          personName={`${personToDelete.firstName} ${personToDelete.lastName}`}
          open
          onOpenChange={handleDeleteDialogOpenChange}
          onDeleted={handlePersonDeleted}
        />
      ) : null}

      {personToUpdateStatus ? (
        <PersonStatusDialog
          institutionId={institutionId}
          personId={personToUpdateStatus.id}
          personName={`${personToUpdateStatus.firstName} ${personToUpdateStatus.lastName}`}
          enabled={personToUpdateStatus.enabled}
          open
          onOpenChange={handleStatusDialogOpenChange}
          onUpdated={handleStatusUpdated}
        />
      ) : null}
    </div>
  );
}
