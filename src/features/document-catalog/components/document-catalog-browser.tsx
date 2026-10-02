"use client";

import * as React from "react";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2Icon, CircleAlertIcon, EllipsisVerticalIcon, FileTextIcon, PlusIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@common/components/ui/context-menu";
import { DataTableFilters } from "@common/components/ui/data-table-filters";
import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@common/components/ui/empty";
import { Skeleton } from "@common/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { PAGE_SIZE_OPTIONS, parsePaginationQuery } from "@common/utils/pagination-query.util";

import { getAcademicRegistrationSummary } from "@features/academic/utils/academic-pagination.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { DocumentCatalogForm } from "@features/document-catalog/components/document-catalog-form";
import { DocumentCatalogReadDetail } from "@features/document-catalog/components/document-catalog-read-detail";
import { DOCUMENT_CATALOG_STATE_FILTER_OPTIONS } from "@features/document-catalog/constants/document-catalog.constants";
import { fetchDocumentCatalog } from "@features/document-catalog/services/document-catalog-client.service";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";
import { formatDocumentFileCategories } from "@features/enrollment-applications/utils/document-file-category.util";
import { PlatformCollectionActions } from "@features/platform-auth/components/platform-collection-actions";

type DocumentCatalogBrowserProps = {
  scope: AcademicScope;
  institutionId: string;
  canManage: boolean;
  institutionSelect?: React.ReactNode;
  initialSelected?: DocumentDefinition;
  returnTo?: string;
};

export function DocumentCatalogBrowser(props: DocumentCatalogBrowserProps): React.ReactElement {
  return (
    <DataTableNavigationProvider>
      <DocumentCatalogView {...props} />
    </DataTableNavigationProvider>
  );
}

function DocumentCatalogView({
  scope,
  institutionId,
  canManage,
  institutionSelect,
  initialSelected,
  returnTo,
}: DocumentCatalogBrowserProps): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [selected, setSelected] = React.useState<DocumentDefinition | null | undefined>(initialSelected);
  const [savedName, setSavedName] = React.useState("");
  const [editorPending, setEditorPending] = React.useState(false);
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

      return fetchDocumentCatalog<PaginatedResponse<DocumentDefinition>>(scope, institutionId, `?${filters}`, signal);
    },
    enabled: selected === undefined,
    gcTime: 0,
  });

  function href(changes: Record<string, string | undefined>): string {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value === undefined) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }

    return `${pathname}?${next}`;
  }

  function navigate(changes: Record<string, string | undefined>): void {
    router.replace(href(changes), { scroll: false });
  }

  function closeEditor(): void {
    if (returnTo) {
      router.push(returnTo);
      return;
    }

    setSelected(undefined);
    navigate({ documentId: undefined });
  }

  function selectDocument(event: React.MouseEvent<HTMLAnchorElement>, document: DocumentDefinition): void {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    setSavedName("");
    setSelected(document);
    navigate({ documentId: document.id });
  }

  if (selected !== undefined) {
    return (
      <div className="space-y-4">
        <Button type="button" size="lg" variant="outline" onClick={closeEditor} disabled={editorPending} className="w-full sm:w-auto">
          Volver
        </Button>
        {canManage ? (
          <DocumentCatalogForm
            key={selected?.id ?? "new"}
            scope={scope}
            institutionId={institutionId}
            institutionField={institutionSelect}
            initial={selected ?? undefined}
            onSaved={(document) => {
              setSavedName(document.name);
              closeEditor();
              void query.refetch();
            }}
            onCancel={closeEditor}
            onPendingChange={setEditorPending}
          />
        ) : selected ? (
          <DocumentCatalogReadDetail document={selected} scope={scope} institutionId={institutionId} onClose={closeEditor} />
        ) : null}
      </div>
    );
  }

  const items = query.data?.items ?? [];
  const totalPages = query.data?.totalPages ?? 0;
  const hasFilters = search.length > 0 || active !== "all";

  return (
    <div className="flex h-full min-w-0 flex-col gap-4">
      <PlatformCollectionActions className="sm:justify-start">
        {canManage ? (
          <Button
            type="button"
            size="lg"
            onClick={() => {
              setSavedName("");
              setSelected(null);
              navigate({ documentId: undefined });
            }}
          >
            <PlusIcon />
            Crear documento
          </Button>
        ) : null}
      </PlatformCollectionActions>
      {savedName ? (
        <Alert variant="success" role="status">
          <CheckCircle2Icon />
          <AlertTitle>Documento guardado</AlertTitle>
          <AlertDescription>{savedName}</AlertDescription>
        </Alert>
      ) : null}
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
      <div className="relative h-full min-w-0 overflow-hidden rounded-lg border" aria-busy={query.isFetching}>
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
        ) : query.isLoading ? (
          <div role="status" aria-label="Cargando documentación" className="space-y-3 p-4">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Empty className="h-full px-4 py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileTextIcon />
              </EmptyMedia>
              <EmptyTitle>{hasFilters ? "Sin documentos para estos filtros" : "Sin documentos en el catálogo"}</EmptyTitle>
              <EmptyDescription>
                {hasFilters
                  ? "Buscá otro nombre o cambiá el estado seleccionado."
                  : "Creá un documento para configurarlo en los trayectos de la institución."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table containerClassName="table-scrollbar" className="min-w-180">
            <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
              <TableRow>
                <TableHead className="w-16 pl-4">
                  <span className="sr-only">Acciones</span>
                </TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Formatos</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
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
                              <Link href={href({ documentId: item.id })} onClick={(event) => selectDocument(event, item)} className="px-2.5 py-1.5">
                                {canManage ? "Editar documento" : "Ver documento"}
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link href={href({ documentId: item.id })} className="hover:underline" onClick={(event) => selectDocument(event, item)}>
                          {item.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDocumentFileCategories(item.allowedFormats)}</TableCell>
                      <TableCell>
                        <Badge variant={item.active ? "success" : "secondary"}>{item.active ? "Activo" : "Inactivo"}</Badge>
                      </TableCell>
                    </TableRow>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-44 p-1.5">
                    <ContextMenuItem asChild>
                      <Link href={href({ documentId: item.id })} onClick={(event) => selectDocument(event, item)} className="px-2.5 py-1.5">
                        {canManage ? "Editar documento" : "Ver documento"}
                      </Link>
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <DataTablePagination
        page={page}
        size={size}
        totalPages={totalPages}
        summaryLabel={getAcademicRegistrationSummary(query.data?.totalItems ?? 0, "documento", "documentos")}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        isPending={query.isFetching}
        onPageChange={(value) => navigate({ page: String(value) })}
        onPageSizeChange={(value) => navigate({ size: value, page: "0" })}
      />
    </div>
  );
}
