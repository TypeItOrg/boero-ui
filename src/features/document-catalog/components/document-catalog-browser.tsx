"use client";

import * as React from "react";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

import { useQuery } from "@tanstack/react-query";
import { CircleAlertIcon, EllipsisVerticalIcon, FileTextIcon, PlusIcon, SearchIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@common/components/ui/context-menu";
import { DataTableFilters } from "@common/components/ui/data-table-filters";
import { DataTableNavigationProvider, useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTableLoadingOverlay } from "@common/components/ui/data-table-loading-overlay";
import { DataTableEmptyStateActions } from "@common/components/ui/data-table-empty-state-actions";
import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@common/components/ui/empty";
import { DATA_TABLE_EMPTY_MESSAGES } from "@common/constants/data-table-empty.constants";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { PAGE_SIZE_OPTIONS, parsePaginationQuery } from "@common/utils/pagination-query.util";
import { cn } from "@common/utils/cn.util";
import { appendReturnTo } from "@common/utils/return-to.util";

import { getAcademicRegistrationSummary } from "@features/academic/utils/academic-pagination.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { DOCUMENT_CATALOG_STATE_FILTER_OPTIONS } from "@features/document-catalog/constants/document-catalog.constants";
import { fetchPlatformDocumentCatalog, fetchDocumentCatalog } from "@features/document-catalog/services/document-catalog-client.service";
import { getDocumentCatalogDetailPageUrl, getDocumentCatalogEditPageUrl } from "@features/document-catalog/utils/document-catalog-route.util";
import type { PlatformDocumentDefinition } from "@features/document-catalog/types/platform-document-definition.types";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";
import { formatDocumentFileCategories } from "@features/enrollment-applications/utils/document-file-category.util";
import { PlatformCollectionActions } from "@features/platform-auth/components/platform-collection-actions";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformRouteSkeleton } from "@features/platform-auth/components/platform-route-skeleton";
import { InstitutionalRouteSkeleton } from "@features/institutional-auth/components/institutional-route-skeleton";

type DocumentCatalogBrowserProps = {
  scope: AcademicScope;
  institutionId?: string;
  canManage: boolean;
  breadcrumb: React.ReactNode;
  institutionSelect?: React.ReactNode;
};

export function DocumentCatalogBrowser(props: DocumentCatalogBrowserProps): React.ReactElement {
  return (
    <DataTableNavigationProvider>
      <DocumentCatalogView {...props} />
    </DataTableNavigationProvider>
  );
}

function DocumentCatalogView({ scope, institutionId, canManage, breadcrumb, institutionSelect }: DocumentCatalogBrowserProps): React.ReactElement {
  const { isPending: isNavigationPending, navigate: navigateTable } = useDataTableNavigation();
  const pathname = usePathname();
  const params = useSearchParams();
  const { page, size, search } = parsePaginationQuery(
    { page: params.get("page") ?? undefined, size: params.get("size") ?? undefined, search: params.get("search") ?? undefined },
    { defaultSize: 20 },
  );
  const active = DOCUMENT_CATALOG_STATE_FILTER_OPTIONS.find((option) => option.value === params.get("active"))?.value ?? "true";

  const query = useQuery({
    queryKey: ["document-catalog", scope, institutionId, page, size, search, active],
    queryFn: ({ signal }) => {
      const filters = new URLSearchParams({ page: String(page), size: String(size), search });
      if (active !== "all") {
        filters.set("active", active);
      }

      if (scope === "admin") {
        if (institutionId) {
          filters.set("institutionId", institutionId);
        }

        return fetchPlatformDocumentCatalog(filters, signal);
      }
      if (!institutionId) {
        throw new Error("No se pudo identificar la institución.");
      }

      return fetchDocumentCatalog<PaginatedResponse<DocumentDefinition | PlatformDocumentDefinition>>(scope, institutionId, `?${filters}`, signal);
    },
    placeholderData: (previousData, previousQuery) => {
      if (previousQuery?.queryKey[1] === scope && previousQuery.queryKey[2] === institutionId) {
        return previousData;
      }

      return undefined;
    },
    gcTime: 0,
  });
  const [hasSettledInitialQuery, setHasSettledInitialQuery] = React.useState(false);
  if (!hasSettledInitialQuery && !query.isPending) {
    setHasSettledInitialQuery(true);
  }

  const isTablePending = isNavigationPending || query.isFetching;

  function href(changes: Record<string, string | undefined>): string {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value === undefined) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }

    return `${pathname}${next.size ? `?${next}` : ""}`;
  }

  function navigate(changes: Record<string, string | undefined>): void {
    navigateTable(changes, { replace: true, scroll: false });
  }

  function documentHref(item: DocumentDefinition | PlatformDocumentDefinition): string {
    return appendReturnTo(getDocumentCatalogDetailPageUrl(scope, item.institutionId, item.id), href({ returnTo: undefined }));
  }

  function editHref(item: DocumentDefinition | PlatformDocumentDefinition): string {
    return appendReturnTo(getDocumentCatalogEditPageUrl(scope, item.institutionId, item.id), href({ returnTo: undefined }));
  }

  if (!hasSettledInitialQuery && query.isLoading) {
    return scope === "admin" ? <PlatformRouteSkeleton /> : <InstitutionalRouteSkeleton />;
  }

  const items = query.data?.items ?? [];
  const totalPages = query.data?.totalPages ?? 0;
  const hasFilters = search.length > 0 || active === "false" || (scope === "admin" && Boolean(institutionId));
  const hasItemsOnOtherPages = (query.data?.totalItems ?? 0) > 0;
  const EmptyIcon = hasFilters && !hasItemsOnOtherPages ? SearchIcon : FileTextIcon;

  return (
    <DocumentCatalogShell breadcrumb={breadcrumb}>
      <div className="flex h-full min-w-0 flex-col gap-4">
        <PlatformCollectionActions className="sm:justify-start">
          {canManage ? (
            <Button size="lg" asChild>
              <Link
                href={appendReturnTo(
                  `${pathname}/new${scope === "admin" && institutionId ? `?institutionId=${institutionId}` : ""}`,
                  href({ returnTo: undefined }),
                )}
              >
                <PlusIcon />
                Crear documento
              </Link>
            </Button>
          ) : null}
        </PlatformCollectionActions>
        <DataTableFilters
          search={search}
          searchPlaceholder="Buscar por nombre de documento..."
          size={size}
          selectFilters={[
            {
              name: "active",
              label: "Estado",
              value: active,
              defaultValue: "true",
              options: DOCUMENT_CATALOG_STATE_FILTER_OPTIONS,
            },
          ]}
        >
          {institutionSelect}
        </DataTableFilters>
        <div
          className={cn("relative h-full min-w-0 overflow-hidden rounded-lg", (query.isLoading || query.isError || items.length > 0) && "border")}
          aria-busy={isTablePending}
        >
          {query.isError ? (
            <Alert variant="destructive" className="m-4 w-auto">
              <CircleAlertIcon />
              <AlertTitle>No se pudo cargar el catálogo</AlertTitle>
              <AlertDescription className="flex flex-wrap items-center gap-3">
                <span>Reintentá la consulta. Los filtros se conservan.</span>
                <Button type="button" size="lg" variant="outline" onClick={() => void query.refetch()}>
                  Reintentar
                </Button>
              </AlertDescription>
            </Alert>
          ) : !query.isLoading && items.length === 0 ? (
            <Empty className="bg-muted/25 h-full min-h-80 rounded-lg border border-solid px-4 py-12">
              <EmptyHeader className="max-w-md">
                <EmptyMedia variant="icon">
                  <EmptyIcon className="size-5" aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle className="mt-2 text-base">
                  {hasItemsOnOtherPages
                    ? "No hay documentos en esta página"
                    : hasFilters
                      ? "No se encontraron documentos"
                      : "Sin documentos para mostrar"}
                </EmptyTitle>
                <EmptyDescription>
                  {hasItemsOnOtherPages
                    ? DATA_TABLE_EMPTY_MESSAGES.PAGE_DESCRIPTION
                    : hasFilters
                      ? "Probá con otro nombre o cambiá los filtros."
                      : canManage
                        ? "Creá un documento para configurarlo en los trayectos."
                        : "Todavía no hay documentos para mostrar en esta vista."}
                </EmptyDescription>
              </EmptyHeader>
              <DataTableEmptyStateActions
                hasFilters={hasFilters}
                hasItemsOnOtherPages={hasItemsOnOtherPages}
                onFirstPage={() => navigate({ page: "0" })}
              />
            </Empty>
          ) : (
            <Table containerClassName="table-scrollbar" className="min-w-180">
              <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
                <TableRow>
                  <TableHead className="w-16 pl-4">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                  <TableHead>Documento</TableHead>
                  {scope === "admin" ? <TableHead>Institución</TableHead> : null}
                  <TableHead>Formatos</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.isLoading ? (
                  <TableRow aria-hidden="true">
                    <TableCell colSpan={scope === "admin" ? 5 : 4} className="h-16" />
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <ContextMenu key={item.id}>
                      <ContextMenuTrigger asChild>
                        <TableRow>
                          <TableCell className="w-16 pl-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button type="button" size="icon-lg" variant="ghost" aria-label={`Abrir acciones de ${item.name}`}>
                                  <EllipsisVerticalIcon />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-44 p-1.5">
                                <DropdownMenuItem asChild>
                                  <Link href={documentHref(item)} className="px-2.5 py-1.5">
                                    Ver detalle
                                  </Link>
                                </DropdownMenuItem>
                                {canManage ? (
                                  <DropdownMenuItem asChild>
                                    <Link href={editHref(item)} className="px-2.5 py-1.5">
                                      Editar
                                    </Link>
                                  </DropdownMenuItem>
                                ) : null}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          <TableCell className="font-medium">
                            <Link href={documentHref(item)} className="hover:underline">
                              {item.name}
                            </Link>
                          </TableCell>
                          {scope === "admin" && "institutionName" in item ? <TableCell>{item.institutionName}</TableCell> : null}
                          <TableCell className="text-muted-foreground">{formatDocumentFileCategories(item.allowedFormats)}</TableCell>
                          <TableCell>
                            <Badge variant={item.active ? "success" : "secondary"}>{item.active ? "Activo" : "Inactivo"}</Badge>
                          </TableCell>
                        </TableRow>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-44 p-1.5">
                        <ContextMenuItem asChild>
                          <Link href={documentHref(item)} className="px-2.5 py-1.5">
                            Ver detalle
                          </Link>
                        </ContextMenuItem>
                        {canManage ? (
                          <ContextMenuItem asChild>
                            <Link href={editHref(item)} className="px-2.5 py-1.5">
                              Editar
                            </Link>
                          </ContextMenuItem>
                        ) : null}
                      </ContextMenuContent>
                    </ContextMenu>
                  ))
                )}
              </TableBody>
            </Table>
          )}
          {isTablePending ? <DataTableLoadingOverlay label="Cargando documentación" /> : null}
        </div>
        {query.isLoading ? (
          <p className="text-muted-foreground px-1 text-sm">Cargando documentación...</p>
        ) : (
          <DataTablePagination
            page={page}
            size={size}
            totalPages={totalPages}
            summaryLabel={getAcademicRegistrationSummary(query.data?.totalItems ?? 0, "documento", "documentos")}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            isPending={isTablePending}
            onPageChange={(value) => navigate({ page: String(value) })}
            onPageSizeChange={(value) => navigate({ size: value, page: "0" })}
          />
        )}
      </div>
    </DocumentCatalogShell>
  );
}

function DocumentCatalogShell({ breadcrumb, children }: { breadcrumb: React.ReactNode; children: React.ReactNode }): React.ReactElement {
  return (
    <PlatformPageShell title="Documentación" breadcrumb={breadcrumb} actions={<PlatformPageIcon icon={FileTextIcon} />}>
      {children}
    </PlatformPageShell>
  );
}
