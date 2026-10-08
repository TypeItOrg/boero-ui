"use client";

import type { ReactElement } from "react";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { CircleAlertIcon, FileTextIcon, PlusIcon, SearchIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { DataTableFilters } from "@common/components/ui/data-table-filters";
import { DataTableLoadingOverlay } from "@common/components/ui/data-table-loading-overlay";
import { DataTableNavigationProvider, useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import { Table, TableBody, TableCell, TableRow } from "@common/components/ui/table";
import { cn } from "@common/utils/cn.util";
import { PAGE_SIZE_OPTIONS, parsePaginationQuery } from "@common/utils/pagination-query.util";
import { appendReturnTo } from "@common/utils/return-to.util";

import { getAcademicRegistrationSummary } from "@features/academic/utils/academic-pagination.util";
import { DocumentCatalogEmptyState } from "@features/document-catalog/components/document-catalog-empty-state";
import { DocumentCatalogShell } from "@features/document-catalog/components/document-catalog-shell";
import { DocumentCatalogTableHeader } from "@features/document-catalog/components/document-catalog-table-header";
import { DocumentCatalogTableRow } from "@features/document-catalog/components/document-catalog-table-row";
import { DOCUMENT_CATALOG_STATE_FILTER_OPTIONS } from "@features/document-catalog/constants/document-catalog.constants";
import { useDocumentCatalogPage } from "@features/document-catalog/hooks/use-document-catalog-page";
import { type DocumentCatalogBrowserProps } from "@features/document-catalog/types/document-catalog-browser-props.types";
import { getDocumentCatalogLinks } from "@features/document-catalog/utils/document-catalog-links.util";
import { InstitutionalRouteSkeleton } from "@features/institutional-auth/components/institutional-route-skeleton";
import { PlatformCollectionActions } from "@features/platform-auth/components/platform-collection-actions";
import { PlatformRouteSkeleton } from "@features/platform-auth/components/platform-route-skeleton";

export function DocumentCatalogBrowser(props: DocumentCatalogBrowserProps): ReactElement {
  return (
    <DataTableNavigationProvider>
      <DocumentCatalogView {...props} />
    </DataTableNavigationProvider>
  );
}

function DocumentCatalogView({ scope, institutionId, canManage, breadcrumb, institutionSelect }: DocumentCatalogBrowserProps): ReactElement {
  const { isPending: isNavigationPending, navigate: navigateTable } = useDataTableNavigation();
  const pathname = usePathname();
  const params = useSearchParams();

  const { page, size, search } = parsePaginationQuery(
    {
      page: params.get("page") ?? undefined,
      size: params.get("size") ?? undefined,
      search: params.get("search") ?? undefined,
    },
    { defaultSize: 20 },
  );

  const active = DOCUMENT_CATALOG_STATE_FILTER_OPTIONS.find((option) => option.value === params.get("active"))?.value ?? "true";

  const { query, hasSettledInitialQuery } = useDocumentCatalogPage({
    scope,
    institutionId,
    page,
    size,
    search,
    active,
  });

  const isTablePending = isNavigationPending || query.isFetching;

  const { href, documentHref, editHref } = getDocumentCatalogLinks(scope, pathname, params);

  function navigate(changes: Record<string, string | undefined>): void {
    navigateTable(changes, { replace: true, scroll: false });
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
            <DocumentCatalogEmptyState
              EmptyIcon={EmptyIcon}
              hasItemsOnOtherPages={hasItemsOnOtherPages}
              hasFilters={hasFilters}
              canManage={canManage}
              navigate={navigate}
            />
          ) : (
            <Table containerClassName="table-scrollbar" className="min-w-180">
              <DocumentCatalogTableHeader scope={scope} />
              <TableBody>
                {query.isLoading ? (
                  <TableRow aria-hidden="true">
                    <TableCell colSpan={scope === "admin" ? 5 : 4} className="h-16" />
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <DocumentCatalogTableRow
                      key={item.id}
                      item={item}
                      documentHref={documentHref}
                      canManage={canManage}
                      editHref={editHref}
                      scope={scope}
                    />
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
