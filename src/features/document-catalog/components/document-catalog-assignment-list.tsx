"use client";

import type { Dispatch, ReactElement, SetStateAction } from "react";

import type { UseQueryResult } from "@tanstack/react-query";
import { CircleAlertIcon, RouteIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { DataTableLoadingOverlay } from "@common/components/ui/data-table-loading-overlay";
import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import { DataTableSortableHead } from "@common/components/ui/data-table-sortable-head";
import { Skeleton } from "@common/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { PAGE_SIZE_OPTIONS } from "@common/utils/pagination-query.util";
import type { Sort } from "@common/utils/sort-query.util";

import { AssignmentInstructions } from "@features/document-catalog/components/document-assignment-instructions";
import { DocumentCatalogAssignmentsEmptyState } from "@features/document-catalog/components/document-catalog-assignments-empty-state";
import type { DocumentAssignmentSortField } from "@features/document-catalog/types/document-assignment-sort-field.types";
import type { DocumentAssignment } from "@features/document-catalog/types/document-assignment.types";
import { DOCUMENT_LEVEL_LABELS } from "@features/enrollment-applications/constants/documentation.constants";

export function DocumentCatalogAssignmentList({
  query,
  sort,
  updateSort,
  setPage,
  page,
  size,
  setSize,
}: {
  query: UseQueryResult<NoInfer<PaginatedResponse<DocumentAssignment>>, Error>;
  sort: Sort<DocumentAssignmentSortField>;
  updateSort: (nextSort: Sort<DocumentAssignmentSortField>) => void;
  setPage: Dispatch<SetStateAction<number>>;
  page: number;
  size: number;
  setSize: Dispatch<SetStateAction<number>>;
}): ReactElement {
  function renderAssignments(): ReactElement | null {
    if (query.isError) {
      return (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>No se pudieron consultar los trayectos</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>Reintentá la consulta para ver las asignaciones.</span>
            <Button type="button" size="lg" variant="outline" disabled={query.isFetching} onClick={() => void query.refetch()}>
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    if (query.isLoading) {
      return <Skeleton className="h-44 w-full rounded-lg" role="status" aria-label="Cargando trayectos asociados" />;
    }

    if (query.data?.items.length) {
      return (
        <div className="min-w-0 overflow-hidden rounded-lg border">
          <Table className="min-w-2xl table-fixed" aria-label="Trayectos asignados al documento">
            <TableHeader className="bg-muted">
              <TableRow>
                <DataTableSortableHead<DocumentAssignmentSortField>
                  scope="col"
                  field="trainingPathName"
                  label="Trayecto"
                  sort={sort}
                  onSortChange={updateSort}
                />
                <DataTableSortableHead<DocumentAssignmentSortField>
                  scope="col"
                  className="w-64"
                  field="level"
                  label="Exigencia"
                  sort={sort}
                  onSortChange={updateSort}
                />
                <DataTableSortableHead<DocumentAssignmentSortField>
                  scope="col"
                  className="w-24 text-right [&_button]:-mr-2 [&_button]:ml-auto"
                  field="displayOrder"
                  label="Orden"
                  sort={sort}
                  onSortChange={updateSort}
                />
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.items.map((path) => (
                <TableRow key={path.trainingPathId}>
                  <TableCell className="py-3 whitespace-normal">
                    <p className="font-medium break-words">{path.trainingPathName}</p>
                    {path.specificInstructions ? <AssignmentInstructions instructions={path.specificInstructions} /> : null}
                  </TableCell>
                  <TableCell className="py-3 whitespace-normal">{DOCUMENT_LEVEL_LABELS[path.level]}</TableCell>
                  <TableCell className="py-3 text-right tabular-nums">{path.displayOrder}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    return (
      <DocumentCatalogAssignmentsEmptyState
        withinReadScope
        hasItemsOnOtherPages={Boolean(query.data && query.data.totalItems > 0)}
        onFirstPage={() => setPage(0)}
      />
    );
  }

  return (
    <section aria-labelledby="document-paths-title" className="bg-muted/25 min-w-0 rounded-xl border p-5 md:p-6">
      <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
        <SectionHeader
          icon={RouteIcon}
          title="Trayectos asignados"
          titleId="document-paths-title"
          description="Consultá la exigencia y las instrucciones del documento en cada trayecto."
        />
      </header>
      <div className="pt-5" aria-busy={query.isFetching}>
        <div className="relative min-w-0 overflow-hidden rounded-lg">
          {renderAssignments()}
          {query.isFetching && !query.isLoading ? <DataTableLoadingOverlay label="Cargando trayectos asociados" /> : null}
        </div>
        {query.data && !query.isError && query.data.totalItems > 0 ? (
          <div className="mt-4">
            <DataTablePagination
              page={page}
              size={size}
              totalPages={query.data.totalPages}
              summaryLabel={`${query.data.totalItems} ${query.data.totalItems === 1 ? "trayecto asignado" : "trayectos asignados"}.`}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              isPending={query.isFetching}
              onPageChange={setPage}
              onPageSizeChange={(value) => {
                setSize(Number(value));
                setPage(0);
              }}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
