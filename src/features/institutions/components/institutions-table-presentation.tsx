"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BuildingIcon, EllipsisVerticalIcon, Loader2Icon, PlusIcon, SearchIcon, UserIcon } from "lucide-react";
import { toast } from "sonner";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@common/components/ui/avatar";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTableSortableHead } from "@common/components/ui/data-table-sortable-head";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@common/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@common/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { PaginationParams } from "@common/types/pagination.types";
import { InstitutionsPagination } from "@features/institutions/components/institutions-pagination";
import { InstitutionStatusDialog } from "@features/institutions/components/institution-status-dialog";
import type { InstitutionSummary } from "@features/institutions/types/institution-summary.types";
import type { InstitutionSort, InstitutionSortField } from "@features/institutions/utils/institution-pagination.util";

type InstitutionsTablePresentationProps = PaginationParams & {
  data: PaginatedResponse<InstitutionSummary>;
  sort: InstitutionSort;
  search: string;
  active: boolean | undefined;
};

export function InstitutionsTablePresentation({
  data,
  page,
  size,
  sort,
  search,
  active,
}: InstitutionsTablePresentationProps): React.ReactElement {
  const router = useRouter();
  const { isPending: isNavigating, navigate } = useDataTableNavigation();
  const [statusTargetInstitution, setStatusTargetInstitution] = useState<InstitutionSummary>();

  function navigateToPage(newPage: number): void {
    navigate({ page: String(newPage), size: String(size) });
  }

  function updatePageSize(newSize: string): void {
    navigate({ page: "0", size: newSize });
  }

  function updateSort(nextSort: InstitutionSort): void {
    navigate({ page: "0", sortField: nextSort.field, sortDirection: nextSort.direction });
  }

  if (data.items.length === 0) {
    const hasFilters = search.trim() !== "" || active !== undefined;

    let emptyStateContent: React.ReactNode;

    if (data.totalItems > 0) {
      emptyStateContent = (
        <div className="bg-muted/25 text-muted-foreground flex h-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
          <div className="bg-background border-border/50 text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full border shadow-sm">
            <BuildingIcon className="size-5" />
          </div>
          <h3 className="text-foreground text-base font-semibold">No hay instituciones en esta página</h3>
          <p className="text-muted-foreground mt-1.5 mb-6 max-w-sm text-sm">
            La página seleccionada no contiene elementos. Podés volver a la primera página para ver los resultados.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/institutions?size=${size}`}>Volver a la primera página</Link>
          </Button>
        </div>
      );
    } else if (hasFilters) {
      emptyStateContent = (
        <div className="bg-muted/25 text-muted-foreground flex h-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
          <div className="bg-background border-border/50 text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full border shadow-sm">
            <SearchIcon className="size-5" />
          </div>
          <h3 className="text-foreground text-base font-semibold">No se encontraron resultados</h3>
          <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
            No encontramos ninguna institución que coincida con los criterios de búsqueda seleccionados.
          </p>
        </div>
      );
    } else {
      emptyStateContent = (
        <div className="bg-muted/25 text-muted-foreground flex h-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
          <div className="bg-background border-border/50 text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full border shadow-sm">
            <BuildingIcon className="size-5" />
          </div>
          <h3 className="text-foreground text-base font-semibold">No hay instituciones registradas</h3>
          <p className="text-muted-foreground mt-1.5 mb-6 max-w-sm text-sm">
            Comenzá creando una nueva institución para empezar a gestionar la plataforma.
          </p>
          <Button asChild size="sm">
            <ReturnToLink href="/admin/institutions/new">
              <PlusIcon className="mr-2 size-4" />
              Nueva Institución
            </ReturnToLink>
          </Button>
        </div>
      );
    }

    return (
      <div className="relative h-full" aria-busy={isNavigating}>
        {emptyStateContent}
        {isNavigating ? (
          <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
            <Loader2Icon
              className="text-muted-foreground size-5 animate-spin"
              aria-label="Cargando instituciones"
              role="status"
            />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative h-full overflow-hidden rounded-lg border" aria-busy={isNavigating}>
        <Table containerClassName="table-scrollbar" className="min-w-240">
          <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
            <TableRow className="hover:bg-muted/50 border-b transition-colors">
              <DataTableSortableHead<InstitutionSortField>
                field="name"
                label="Nombre"
                sort={sort}
                onSortChange={updateSort}
              />
              <TableHead>País</TableHead>
              <TableHead>Provincia</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>Usuarios</TableHead>
              <DataTableSortableHead<InstitutionSortField>
                field="active"
                label="Estado"
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
            {data.items.map((institution) => (
              <ContextMenu key={institution.id}>
                <ContextMenuTrigger asChild>
                  <TableRow>
                    <TableCell className="font-medium">
                      <Link className="hover:underline" href={`/admin/institutions/${institution.id}`}>
                        {institution.name}
                      </Link>
                    </TableCell>
                    <TableCell>{institution.country.name}</TableCell>
                    <TableCell>{institution.province}</TableCell>
                    <TableCell>{institution.city}</TableCell>
                    <TableCell>
                      <InstitutionUsersCell institution={institution} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={institution.active ? "success" : "destructive"}>
                        {institution.active ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-4">
                      <InstitutionActionsMenu
                        institution={institution}
                        onStatusChange={() => setStatusTargetInstitution(institution)}
                      />
                    </TableCell>
                  </TableRow>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-44 p-1.5">
                  {getInstitutionActions(institution).map((action) => (
                    <ContextMenuItem key={action.href} asChild>
                      {action.preserveReturnTo ? (
                        <ReturnToLink href={action.href} className="px-2.5 py-1.5">
                          {action.label}
                        </ReturnToLink>
                      ) : (
                        <Link href={action.href} className="px-2.5 py-1.5">
                          {action.label}
                        </Link>
                      )}
                    </ContextMenuItem>
                  ))}
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    variant={institution.active ? "destructive" : "default"}
                    className="px-2.5 py-1.5"
                    onSelect={() => setStatusTargetInstitution(institution)}
                  >
                    {institution.active ? "Desactivar" : "Activar"}
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </TableBody>
        </Table>
        {isNavigating && (
          <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px]">
            <Loader2Icon
              className="text-muted-foreground size-5 animate-spin"
              aria-label="Cargando instituciones"
              role="status"
            />
          </div>
        )}
      </div>

      <InstitutionsPagination
        page={page}
        size={size}
        totalItems={data.totalItems}
        totalPages={data.totalPages}
        isPending={isNavigating}
        onPageChange={navigateToPage}
        onPageSizeChange={updatePageSize}
      />

      {statusTargetInstitution ? (
        <InstitutionStatusDialog
          institutionId={statusTargetInstitution.id}
          institutionName={statusTargetInstitution.name}
          active={statusTargetInstitution.active}
          open={Boolean(statusTargetInstitution)}
          onOpenChange={(open) => {
            if (!open) setStatusTargetInstitution(undefined);
          }}
          onUpdated={() => {
            const nextActive = !statusTargetInstitution.active;
            toast.success(`${statusTargetInstitution.name} fue ${nextActive ? "activada" : "desactivada"}.`);
            setStatusTargetInstitution(undefined);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}

type InstitutionAction = {
  label: string;
  href: string;
  preserveReturnTo?: boolean;
};

function getInstitutionActions(institution: InstitutionSummary): InstitutionAction[] {
  const detailHref = `/admin/institutions/${institution.id}`;

  if (!institution.active) {
    return [{ label: "Ver", href: detailHref }];
  }

  return [
    { label: "Ver", href: detailHref },
    { label: "Editar", href: `${detailHref}/edit`, preserveReturnTo: true },
    { label: "Usuarios", href: `${detailHref}/people` },
  ];
}

function InstitutionUsersCell({ institution }: { institution: InstitutionSummary }): React.ReactElement {
  const count = Number.isFinite(institution.userCount) ? institution.userCount : 0;

  if (count === 0) {
    return <span className="text-muted-foreground/60">Sin usuarios</span>;
  }

  const maxAvatars = 3;
  const visibleAvatars = Math.min(count, maxAvatars);
  const overflow = count - visibleAvatars;

  return (
    <Link href={`/admin/institutions/${institution.id}/people`} className="inline-flex items-center">
      <AvatarGroup>
        {Array.from({ length: visibleAvatars }).map((_, index) => (
          <Avatar key={index} size="sm">
            <AvatarFallback>
              <UserIcon className="size-3" />
            </AvatarFallback>
          </Avatar>
        ))}
        {overflow > 0 && <AvatarGroupCount>+{overflow}</AvatarGroupCount>}
      </AvatarGroup>
    </Link>
  );
}

type InstitutionActionsMenuProps = {
  institution: InstitutionSummary;
  onStatusChange: () => void;
};

function InstitutionActionsMenu({ institution, onStatusChange }: InstitutionActionsMenuProps): React.ReactElement {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Abrir acciones de ${institution.name}`}>
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 p-1.5">
          <DropdownMenuGroup>
            {getInstitutionActions(institution).map((action) => (
              <DropdownMenuItem key={action.href} asChild>
                {action.preserveReturnTo ? (
                  <ReturnToLink href={action.href} className="px-2.5 py-1.5">
                    {action.label}
                  </ReturnToLink>
                ) : (
                  <Link href={action.href} className="px-2.5 py-1.5">
                    {action.label}
                  </Link>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant={institution.active ? "destructive" : "default"}
            className="px-2.5 py-1.5"
            onSelect={onStatusChange}
          >
            {institution.active ? "Desactivar" : "Activar"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
