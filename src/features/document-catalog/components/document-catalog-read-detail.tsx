"use client";

import * as React from "react";

import { useQuery } from "@tanstack/react-query";
import { FileTextIcon, CircleAlertIcon, RouteIcon } from "lucide-react";

import { OptionalValue } from "@common/components/optional-value";
import { SectionHeader } from "@common/components/section-header";
import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { DataTableLoadingOverlay } from "@common/components/ui/data-table-loading-overlay";
import { DataTableSortableHead } from "@common/components/ui/data-table-sortable-head";
import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@common/components/ui/table";
import { Skeleton } from "@common/components/ui/skeleton";
import { DETAIL_LABEL_CLASS_NAME } from "@common/constants/detail-label.constants";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { Sort } from "@common/utils/sort-query.util";
import type { DocumentAssignmentSortField } from "@features/document-catalog/types/document-assignment-sort-field.types";
import { PAGE_SIZE_OPTIONS } from "@common/utils/pagination-query.util";

import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { fetchDocumentCatalog } from "@features/document-catalog/services/document-catalog-client.service";
import { DocumentCatalogAssignmentsEmptyState } from "@features/document-catalog/components/document-catalog-assignments-empty-state";
import type { DocumentAssignment } from "@features/document-catalog/types/document-assignment.types";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";
import { DOCUMENT_LEVEL_LABELS } from "@features/enrollment-applications/constants/documentation.constants";
import { formatDocumentFileCategories } from "@features/enrollment-applications/utils/document-file-category.util";

export function DocumentCatalogReadDetail({
  document,
  scope,
  institutionId,
  institutionName,
}: {
  document: DocumentDefinition;
  scope: AcademicScope;
  institutionId: string;
  institutionName?: string;
}): React.ReactElement {
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(20);
  const [sort, setSort] = React.useState<Sort<DocumentAssignmentSortField>>({ field: "displayOrder", direction: "asc" });

  function updateSort(nextSort: Sort<DocumentAssignmentSortField>): void {
    setSort(nextSort);
    setPage(0);
  }
  const query = useQuery({
    queryKey: ["document-catalog-associations", scope, institutionId, document.id, page, size, sort.field, sort.direction, true],
    queryFn: ({ signal }) =>
      fetchDocumentCatalog<PaginatedResponse<DocumentAssignment>>(
        scope,
        institutionId,
        `/${document.id}/training-paths?page=${page}&size=${size}&sortField=${sort.field}&sortDirection=${sort.direction}&active=true`,
        signal,
      ),
    placeholderData: (previousData, previousQuery) => {
      if (
        previousQuery?.queryKey[1] === scope &&
        previousQuery.queryKey[2] === institutionId &&
        previousQuery.queryKey[3] === document.id &&
        previousQuery.queryKey[8] === true
      ) {
        return previousData;
      }

      return undefined;
    },
    gcTime: 0,
  });

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <section aria-labelledby="document-info-title" className="bg-muted/25 rounded-xl border p-5 md:p-6">
        <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
          <SectionHeader
            icon={FileTextIcon}
            title="Información del documento"
            description="Estado, formatos permitidos e instrucciones generales."
            titleId="document-info-title"
          />
        </header>
        <dl className="grid gap-5 pt-5 sm:grid-cols-2">
          <div>
            <dt className={DETAIL_LABEL_CLASS_NAME}>Estado</dt>
            <dd className="mt-1">
              <Badge variant={document.active ? "success" : "secondary"}>{document.active ? "Activo" : "Inactivo"}</Badge>
            </dd>
          </div>
          <div>
            <dt className={DETAIL_LABEL_CLASS_NAME}>Formatos permitidos</dt>
            <dd className="mt-1 text-sm leading-relaxed">{formatDocumentFileCategories(document.allowedFormats)}</dd>
          </div>
          {institutionName ? (
            <div>
              <dt className={DETAIL_LABEL_CLASS_NAME}>Institución</dt>
              <dd className="mt-1 text-sm leading-relaxed break-words">{institutionName}</dd>
            </div>
          ) : null}
          <div className={institutionName ? undefined : "sm:col-span-2"}>
            <dt className={DETAIL_LABEL_CLASS_NAME}>Instrucciones generales</dt>
            <dd className="mt-1 max-w-prose text-sm leading-relaxed break-words whitespace-pre-wrap">
              <OptionalValue value={document.instructions} fallback="No especificadas" />
            </dd>
          </div>
        </dl>
      </section>
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
            {query.isError ? (
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
            ) : query.isLoading ? (
              <Skeleton className="h-44 w-full rounded-lg" role="status" aria-label="Cargando trayectos asociados" />
            ) : query.data?.items.length ? (
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
            ) : (
              <DocumentCatalogAssignmentsEmptyState
                withinReadScope
                hasItemsOnOtherPages={Boolean(query.data && query.data.totalItems > 0)}
                onFirstPage={() => setPage(0)}
              />
            )}
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
    </div>
  );
}

function AssignmentInstructions({ instructions }: { instructions: string }): React.ReactElement {
  return (
    <p className="text-muted-foreground mt-2 max-w-prose text-sm leading-relaxed break-words whitespace-pre-wrap">
      <span className="font-medium">Instrucciones específicas: </span>
      {instructions}
    </p>
  );
}
