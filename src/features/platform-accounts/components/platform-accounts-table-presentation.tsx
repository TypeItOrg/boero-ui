"use client";

import Link from "next/link";
import { EllipsisVerticalIcon, FingerprintIcon, Loader2Icon, PlusIcon, SearchIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTableSortableHead } from "@common/components/ui/data-table-sortable-head";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@common/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@common/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { PaginationParams } from "@common/types/pagination.types";
import { PlatformAccountsPagination } from "@features/platform-accounts/components/platform-accounts-pagination";
import type { PlatformAccountAdmin } from "@features/platform-accounts/types/platform-account.types";
import type {
  PlatformAccountSort,
  PlatformAccountSortField,
} from "@features/platform-accounts/utils/platform-account-pagination.util";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

type PlatformAccountsTablePresentationProps = PaginationParams & {
  data: PaginatedResponse<PlatformAccountAdmin>;
  sort: PlatformAccountSort;
  search: string;
  enabled: boolean | undefined;
};

export function PlatformAccountsTablePresentation({
  data,
  page,
  size,
  sort,
  search,
  enabled,
}: PlatformAccountsTablePresentationProps): React.ReactElement {
  const { isPending, navigate } = useDataTableNavigation();

  function updateSort(nextSort: PlatformAccountSort): void {
    navigate({ page: "0", sortField: nextSort.field, sortDirection: nextSort.direction });
  }

  if (data.items.length === 0) {
    return (
      <div className="relative h-full" aria-busy={isPending}>
        <PlatformAccountsEmptyState data={data} search={search} enabled={enabled} size={size} />
        {isPending ? (
          <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
            <Loader2Icon
              className="text-muted-foreground size-5 animate-spin"
              aria-label="Cargando administradores"
              role="status"
            />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative h-full overflow-hidden rounded-lg border" aria-busy={isPending}>
        <Table containerClassName="table-scrollbar" className="min-w-220">
          <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
            <TableRow>
              <DataTableSortableHead<PlatformAccountSortField>
                field="name"
                label="Nombre"
                sort={sort}
                onSortChange={updateSort}
              />
              <DataTableSortableHead<PlatformAccountSortField>
                field="email"
                label="Correo electrónico"
                sort={sort}
                onSortChange={updateSort}
              />
              <TableHead>Rol</TableHead>
              <DataTableSortableHead<PlatformAccountSortField>
                field="enabled"
                label="Estado"
                sort={sort}
                defaultDirection="desc"
                onSortChange={updateSort}
              />
              <DataTableSortableHead<PlatformAccountSortField>
                field="createdAt"
                label="Fecha de alta"
                sort={sort}
                defaultDirection="desc"
                onSortChange={updateSort}
              />
              <TableHead className="w-16 pr-4">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((account) => (
              <ContextMenu key={account.platformAccountId}>
                <ContextMenuTrigger asChild>
                  <TableRow>
                    <TableCell className="font-medium">
                      <Link className="hover:underline" href={`/admin/accounts/${account.platformAccountId}`}>
                        {account.name} {account.lastName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{account.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{account.roleName}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={account.enabled ? "success" : "destructive"}>
                        {account.enabled ? "Habilitada" : "Deshabilitada"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {dateFormatter.format(new Date(account.createdAt))}
                    </TableCell>
                    <TableCell className="pr-4">
                      <PlatformAccountActions account={account} />
                    </TableCell>
                  </TableRow>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-40 p-1.5">
                  <ContextMenuGroup>
                    <ContextMenuItem asChild>
                      <Link href={`/admin/accounts/${account.platformAccountId}`} className="px-2.5 py-1.5">
                        Ver detalle
                      </Link>
                    </ContextMenuItem>
                    <ContextMenuItem asChild>
                      <Link href={`/admin/accounts/${account.platformAccountId}/edit`} className="px-2.5 py-1.5">
                        Editar
                      </Link>
                    </ContextMenuItem>
                  </ContextMenuGroup>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </TableBody>
        </Table>

        {isPending ? (
          <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px]">
            <Loader2Icon
              className="text-muted-foreground size-5 animate-spin"
              aria-label="Cargando administradores"
              role="status"
            />
          </div>
        ) : null}
      </div>

      <PlatformAccountsPagination
        page={page}
        size={size}
        totalItems={data.totalItems}
        totalPages={data.totalPages}
        isPending={isPending}
        onPageChange={(nextPage) => navigate({ page: String(nextPage), size: String(size) })}
        onPageSizeChange={(nextSize) => navigate({ page: "0", size: nextSize })}
      />
    </div>
  );
}

function PlatformAccountActions({ account }: { account: PlatformAccountAdmin }): React.ReactElement {
  const accountName = `${account.name} ${account.lastName}`;

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Abrir acciones de ${accountName}`}>
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 p-1.5">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href={`/admin/accounts/${account.platformAccountId}`} className="px-2.5 py-1.5">
                Ver detalle
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/accounts/${account.platformAccountId}/edit`} className="px-2.5 py-1.5">
                Editar
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

type PlatformAccountsEmptyStateProps = {
  data: PaginatedResponse<PlatformAccountAdmin>;
  search: string;
  enabled: boolean | undefined;
  size: number;
};

function PlatformAccountsEmptyState({
  data,
  search,
  enabled,
  size,
}: PlatformAccountsEmptyStateProps): React.ReactElement {
  const hasFilters = search.trim() !== "" || enabled !== undefined;

  if (data.totalItems > 0) {
    return (
      <div className="bg-muted/25 text-muted-foreground flex h-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
        <div className="bg-background border-border/50 text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full border shadow-sm">
          <FingerprintIcon className="size-5" />
        </div>
        <h3 className="text-foreground text-base font-semibold">No hay administradores en esta página</h3>
        <p className="text-muted-foreground mt-1.5 mb-6 max-w-sm text-sm">
          La página seleccionada no contiene elementos. Podés volver a la primera página para ver los resultados.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/accounts?size=${size}`}>Volver a la primera página</Link>
        </Button>
      </div>
    );
  }

  if (hasFilters) {
    return (
      <div className="bg-muted/25 text-muted-foreground flex h-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
        <div className="bg-background border-border/50 text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full border shadow-sm">
          <SearchIcon className="size-5" />
        </div>
        <h3 className="text-foreground text-base font-semibold">No se encontraron resultados</h3>
        <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
          No encontramos ningún administrador que coincida con los criterios de búsqueda seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-muted/25 text-muted-foreground flex h-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
      <div className="bg-background border-border/50 text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full border shadow-sm">
        <FingerprintIcon className="size-5" />
      </div>
      <h3 className="text-foreground text-base font-semibold">No hay administradores</h3>
      <p className="text-muted-foreground mt-1.5 mb-6 max-w-sm text-sm">
        Comenzá creando un nuevo administrador para empezar a gestionar la plataforma.
      </p>
      <Button asChild size="sm">
        <Link href="/admin/accounts/new">
          <PlusIcon className="mr-2 size-4" />
          Nuevo administrador
        </Link>
      </Button>
    </div>
  );
}
