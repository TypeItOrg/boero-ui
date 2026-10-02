"use client";

import * as React from "react";

import { useQuery } from "@tanstack/react-query";
import { FileTextIcon, CircleAlertIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import { Skeleton } from "@common/components/ui/skeleton";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { PAGE_SIZE_OPTIONS } from "@common/utils/pagination-query.util";

import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { fetchDocumentCatalog } from "@features/document-catalog/services/document-catalog-client.service";
import type { DocumentAssignment } from "@features/document-catalog/types/document-assignment.types";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";
import { DOCUMENT_LEVEL_LABELS } from "@features/enrollment-applications/constants/documentation.constants";
import { formatDocumentFileCategories } from "@features/enrollment-applications/utils/document-file-category.util";

export function DocumentCatalogReadDetail({
  document,
  scope,
  institutionId,
  onClose,
}: {
  document: DocumentDefinition;
  scope: AcademicScope;
  institutionId: string;
  onClose: () => void;
}): React.ReactElement {
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(20);
  const query = useQuery({
    queryKey: ["document-catalog-associations", scope, institutionId, document.id, page, size],
    queryFn: ({ signal }) =>
      fetchDocumentCatalog<PaginatedResponse<DocumentAssignment>>(
        scope,
        institutionId,
        `/${document.id}/training-paths?page=${page}&size=${size}`,
        signal,
      ),
    gcTime: 0,
  });

  return (
    <section className="bg-muted/25 space-y-6 rounded-xl border p-4 sm:p-6">
      <SectionHeader icon={FileTextIcon} title={document.name} description={formatDocumentFileCategories(document.allowedFormats)} />
      <Badge variant={document.active ? "success" : "secondary"}>{document.active ? "Activo" : "Inactivo"}</Badge>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Instrucciones generales</h3>
        <p className="text-muted-foreground text-sm break-words whitespace-pre-wrap">{document.instructions || "Sin instrucciones generales"}</p>
      </div>
      <div className="space-y-4 border-t pt-6">
        <h3 className="font-semibold">Trayectos asociados</h3>
        {query.isError ? (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>No se pudieron consultar los trayectos. Cerrá y volvé a abrir el detalle.</AlertDescription>
          </Alert>
        ) : query.isLoading ? (
          <Skeleton className="h-20" />
        ) : query.data?.items.length ? (
          <ul className="divide-y">
            {query.data.items.map((path) => (
              <li key={path.trainingPathId} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium break-words">{path.trainingPathName}</p>
                  <p className="text-muted-foreground text-sm">{DOCUMENT_LEVEL_LABELS[path.level]}</p>
                </div>
                <Badge variant={path.active ? "success" : "secondary"}>{path.active ? "Asignación activa" : "Asignación inactiva"}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">No hay trayectos asociados dentro de tu alcance de lectura.</p>
        )}
        <DataTablePagination
          page={page}
          size={size}
          totalPages={query.data?.totalPages ?? 0}
          summaryLabel={`${query.data?.totalItems ?? 0} trayectos asociados.`}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          isPending={query.isFetching}
          onPageChange={setPage}
          onPageSizeChange={(value) => {
            setSize(Number(value));
            setPage(0);
          }}
        />
      </div>
      <div className="flex justify-end">
        <Button type="button" size="lg" variant="outline" className="w-full sm:w-auto" onClick={onClose}>
          Cerrar detalle
        </Button>
      </div>
    </section>
  );
}
