"use client";

import type { ReactElement } from "react";

import { Loader2Icon } from "lucide-react";

import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTableSortableHead } from "@common/components/ui/data-table-sortable-head";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { PaginationParams } from "@common/types/pagination-params.types";

import { PlatformAccountTableRow } from "@features/platform-accounts/components/platform-account-table-row";
import { PlatformAccountsEmptyState } from "@features/platform-accounts/components/platform-accounts-empty-state";
import { PlatformAccountsPagination } from "@features/platform-accounts/components/platform-accounts-pagination";
import type { PlatformAccountAdmin } from "@features/platform-accounts/types/platform-account-admin.types";
import type { PlatformAccountSort, PlatformAccountSortField } from "@features/platform-accounts/utils/platform-account-pagination.util";

type PlatformAccountsTablePresentationProps = PaginationParams & {
  data: PaginatedResponse<PlatformAccountAdmin>;
  sort: PlatformAccountSort;
  search: string;
  enabled: boolean | undefined;
};

export function PlatformAccountsTablePresentation({ data, page, size, sort, search, enabled }: PlatformAccountsTablePresentationProps): ReactElement {
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
              <TableHead className="w-16 pl-4">
                <span className="sr-only">Acciones</span>
              </TableHead>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((account) => (
              <PlatformAccountTableRow key={account.platformAccountId} account={account} />
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
