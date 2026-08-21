"use client";

import Link from "next/link";
import { EllipsisVerticalIcon, KeyRoundIcon, Loader2Icon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuTrigger } from "@common/components/ui/context-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTableSortableHead } from "@common/components/ui/data-table-sortable-head";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { PaginationParams } from "@common/types/pagination-params.types";
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
}: PlatformRolesTablePresentationProps): React.ReactElement {
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
              <DataTableSortableHead<PlatformRoleSortField> field="name" label="Rol" sort={sort} onSortChange={updateSort} />
              <DataTableSortableHead<PlatformRoleSortField> field="institutionName" label="Institución" sort={sort} onSortChange={updateSort} />
              <TableHead>Tipo</TableHead>
              <TableHead>Usuarios</TableHead>
              <TableHead>Permisos</TableHead>
              <TableHead className="w-16 pr-4">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((role) => (
              <ContextMenu key={role.id}>
                <ContextMenuTrigger asChild>
                  <TableRow>
                    <TableCell className="font-medium">
                      <Link href={`/admin/roles/${role.id}`} className="hover:underline">
                        {role.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/institutions/${role.institution.id}`} className="text-muted-foreground font-medium hover:underline">
                        {role.institution.name}
                      </Link>
                      {!role.institution.active ? (
                        <Badge variant="outline" className="ml-2">
                          Inactiva
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant={role.technicalCode ? "secondary" : "outline"}>{role.technicalCode ? "Sistema" : "Personalizado"}</Badge>
                    </TableCell>
                    <TableCell>{role.assignmentCount}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5">
                        <KeyRoundIcon className="text-muted-foreground size-4" />
                        {role.permissionCount}
                      </span>
                    </TableCell>
                    <TableCell className="pr-4">
                      <PlatformRoleActions role={role} />
                    </TableCell>
                  </TableRow>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48 p-1.5">
                  <ContextMenuGroup>
                    <ContextMenuItem asChild>
                      <Link href={`/admin/roles/${role.id}`} className="px-2.5 py-1.5">
                        Ver detalle
                      </Link>
                    </ContextMenuItem>
                    {role.editable ? (
                      <ContextMenuItem asChild>
                        <ReturnToLink href={`/admin/roles/${role.id}/edit`} className="px-2.5 py-1.5">
                          Editar rol
                        </ReturnToLink>
                      </ContextMenuItem>
                    ) : (
                      <ContextMenuItem disabled className="px-2.5 py-1.5">
                        Editar rol
                      </ContextMenuItem>
                    )}
                  </ContextMenuGroup>
                </ContextMenuContent>
              </ContextMenu>
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

function PlatformRoleActions({ role }: { role: PlatformRoleListItem }): React.ReactElement {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Abrir acciones de ${role.name}`}>
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 p-1.5">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href={`/admin/roles/${role.id}`} className="px-2.5 py-1.5">
                Ver detalle
              </Link>
            </DropdownMenuItem>
            {role.editable ? (
              <DropdownMenuItem asChild>
                <ReturnToLink href={`/admin/roles/${role.id}/edit`} className="px-2.5 py-1.5">
                  Editar rol
                </ReturnToLink>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled className="px-2.5 py-1.5">
                Editar rol
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function LoadingOverlay(): React.ReactElement {
  return (
    <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px]">
      <Loader2Icon className="text-muted-foreground size-5 animate-spin" aria-label="Cargando roles" role="status" />
    </div>
  );
}
