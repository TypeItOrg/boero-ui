"use client";

import type { ReactElement } from "react";

import { Loader2Icon } from "lucide-react";

import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTableSortableHead } from "@common/components/ui/data-table-sortable-head";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { PaginationParams } from "@common/types/pagination-params.types";

import { PlatformRoleTableRow } from "@features/roles/components/platform-role-table-row";
import { PlatformRolesEmptyState } from "@features/roles/components/platform-roles-empty-state";
import { PlatformRolesPagination } from "@features/roles/components/platform-roles-pagination";
import type { PlatformRoleListItem } from "@features/roles/types/platform-role-list-item.types";
import type { PlatformRoleSort, PlatformRoleSortField } from "@features/roles/utils/platform-role-pagination.util";

type PlatformRolesTablePresentationProps = PaginationParams & {
  data: PaginatedResponse<PlatformRoleListItem>;
  institutionId: string | undefined;
  roleType: "SYSTEM" | "CUSTOM" | undefined;
  search: string;
  sort: PlatformRoleSort;
};

export function PlatformRolesTablePresentation({
  data,
  page,
  size,
  institutionId,
  roleType,
  search,
  sort,
}: PlatformRolesTablePresentationProps): ReactElement {
  const { isPending, navigate } = useDataTableNavigation();

  function updateSort(nextSort: PlatformRoleSort): void {
    navigate({ page: "0", sortField: nextSort.field, sortDirection: nextSort.direction });
  }

  const hasFilters = search.trim() !== "" || institutionId !== undefined || roleType !== undefined;

  if (data.items.length === 0) {
    return (
      <div className="relative h-full" aria-busy={isPending}>
        <PlatformRolesEmptyState data={data} hasFilters={hasFilters} onFirstPage={() => navigate({ page: "0", size: String(size) })} />
        {isPending ? <LoadingOverlay /> : null}
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
              <DataTableSortableHead<PlatformRoleSortField> field="name" label="Rol" sort={sort} onSortChange={updateSort} />
              <DataTableSortableHead<PlatformRoleSortField> field="institutionName" label="Institución" sort={sort} onSortChange={updateSort} />
              <TableHead>Tipo</TableHead>
              <TableHead>Usuarios</TableHead>
              <TableHead>Permisos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((role) => (
              <PlatformRoleTableRow key={role.id} role={role} />
            ))}
          </TableBody>
        </Table>
        {isPending ? <LoadingOverlay /> : null}
      </div>
      <PlatformRolesPagination
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

function LoadingOverlay(): ReactElement {
  return (
    <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px]">
      <Loader2Icon className="text-muted-foreground size-5 animate-spin" aria-label="Cargando roles" role="status" />
    </div>
  );
}
