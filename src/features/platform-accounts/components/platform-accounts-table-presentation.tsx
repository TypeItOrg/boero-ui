"use client";

import { EllipsisVerticalIcon, Loader2Icon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTableSortableHead } from "@common/components/ui/data-table-sortable-head";
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuTrigger } from "@common/components/ui/context-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { PaginationParams } from "@common/types/pagination-params.types";
import { PlatformAccountsEmptyState } from "@features/platform-accounts/components/platform-accounts-empty-state";
import { PlatformAccountsPagination } from "@features/platform-accounts/components/platform-accounts-pagination";
import type { PlatformAccountAdmin } from "@features/platform-accounts/types/platform-account-admin.types";
import type { PlatformAccountSort, PlatformAccountSortField } from "@features/platform-accounts/utils/platform-account-pagination.util";

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
            <Loader2Icon className="text-muted-foreground size-5 animate-spin" aria-label="Cargando administradores" role="status" />
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
              <DataTableSortableHead<PlatformAccountSortField> field="name" label="Nombre" sort={sort} onSortChange={updateSort} />
              <DataTableSortableHead<PlatformAccountSortField> field="email" label="Correo electrónico" sort={sort} onSortChange={updateSort} />
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
                      <ReturnToLink className="hover:underline" href={`/admin/accounts/${account.platformAccountId}`}>
                        {account.name} {account.lastName}
                      </ReturnToLink>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{account.email}</TableCell>
                    <TableCell>
                      <Badge variant={account.roleName === "ADMIN" ? "default" : "secondary"}>{account.roleName}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={account.enabled ? "success" : "destructive"}>{account.enabled ? "Habilitada" : "Deshabilitada"}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">{dateFormatter.format(new Date(account.createdAt))}</TableCell>
                    <TableCell className="pr-4">
                      <PlatformAccountActions account={account} />
                    </TableCell>
                  </TableRow>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-40 p-1.5">
                  <ContextMenuGroup>
                    <ContextMenuItem asChild>
                      <ReturnToLink href={`/admin/accounts/${account.platformAccountId}`} className="px-2.5 py-1.5">
                        Ver detalle
                      </ReturnToLink>
                    </ContextMenuItem>
                    <ContextMenuItem asChild>
                      <ReturnToLink href={`/admin/accounts/${account.platformAccountId}/edit`} className="px-2.5 py-1.5">
                        Editar
                      </ReturnToLink>
                    </ContextMenuItem>
                  </ContextMenuGroup>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </TableBody>
        </Table>

        {isPending ? (
          <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px]">
            <Loader2Icon className="text-muted-foreground size-5 animate-spin" aria-label="Cargando administradores" role="status" />
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
              <ReturnToLink href={`/admin/accounts/${account.platformAccountId}`} className="px-2.5 py-1.5">
                Ver detalle
              </ReturnToLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <ReturnToLink href={`/admin/accounts/${account.platformAccountId}/edit`} className="px-2.5 py-1.5">
                Editar
              </ReturnToLink>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
