"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { BuildingIcon, EllipsisVerticalIcon, Loader2Icon, PlusIcon, SearchIcon, UserIcon } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@common/components/ui/avatar";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { safelyRunAction } from "@common/utils/safe-action.util";
import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";
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
import { updateInstitutionStatusAction } from "@features/institutions/actions/update-institution-status.action";
import { InstitutionsPagination } from "@features/institutions/components/institutions-pagination";
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
  const { isPending: isNavigating, navigate } = useDataTableNavigation();
  const [pendingInstitutionId, setPendingInstitutionId] = useState<string>();
  const [, startMutationTransition] = useTransition();

  function navigateToPage(newPage: number): void {
    navigate({ page: String(newPage), size: String(size) });
  }

  function updatePageSize(newSize: string): void {
    navigate({ page: "0", size: newSize });
  }

  function updateSort(nextSort: InstitutionSort): void {
    navigate({ page: "0", sortField: nextSort.field, sortDirection: nextSort.direction });
  }

  function updateInstitutionStatus(institution: InstitutionSummary): void {
    const nextActive = !institution.active;
    setPendingInstitutionId(institution.id);
    startMutationTransition(async () => {
      const result = await safelyRunAction(
        updateInstitutionStatusAction(institution.id, nextActive),
        INSTITUTION_ERROR_MESSAGES.UPDATE_STATUS(nextActive),
      );

      if (result.error) {
        toast.error(result.error);
        setPendingInstitutionId(undefined);
        return;
      }

      toast.success(`${institution.name} fue ${nextActive ? "activada" : "desactivada"}.`);
      setPendingInstitutionId(undefined);
    });
  }

  if (data.items.length === 0) {
    const hasFilters = search.trim() !== "" || active !== undefined;

    if (data.totalItems > 0) {
      return (
        <div className="bg-muted/25 text-muted-foreground flex h-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
          <div className="bg-background border-border/50 text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full border shadow-sm">
            <BuildingIcon className="size-5" />
          </div>
          <h3 className="text-foreground text-base font-semibold">No hay instituciones en esta página</h3>
          <p className="text-muted-foreground mt-1.5 mb-6 max-w-sm text-sm">
            La página seleccionada no contiene elementos. Podés volver a la primera página para ver los resultados.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href={`/platform/institutions?size=${size}`}>Volver a la primera página</Link>
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
            No encontramos ninguna institución que coincida con los criterios de búsqueda seleccionados.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-muted/25 text-muted-foreground flex h-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
        <div className="bg-background border-border/50 text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full border shadow-sm">
          <BuildingIcon className="size-5" />
        </div>
        <h3 className="text-foreground text-base font-semibold">No hay instituciones registradas</h3>
        <p className="text-muted-foreground mt-1.5 mb-6 max-w-sm text-sm">
          Comenzá creando una nueva institución para empezar a gestionar la plataforma.
        </p>
        <Button asChild size="sm">
          <Link href="/platform/institutions/new">
            <PlusIcon className="mr-2 size-4" />
            Nueva Institución
          </Link>
        </Button>
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
                      <Link className="hover:underline" href={`/platform/institutions/${institution.id}`}>
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
                        isPending={pendingInstitutionId === institution.id}
                        onStatusChange={() => updateInstitutionStatus(institution)}
                      />
                    </TableCell>
                  </TableRow>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-44 p-1.5">
                  {getInstitutionActions(institution).map((action) => (
                    <ContextMenuItem key={action.href} asChild>
                      <Link href={action.href} className="px-2.5 py-1.5">
                        {action.label}
                      </Link>
                    </ContextMenuItem>
                  ))}
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    variant={institution.active ? "destructive" : "default"}
                    className="px-2.5 py-1.5"
                    disabled={pendingInstitutionId === institution.id}
                    onSelect={() => updateInstitutionStatus(institution)}
                  >
                    {getStatusActionLabel(institution.active, pendingInstitutionId === institution.id)}
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
    </div>
  );
}

type InstitutionAction = {
  label: string;
  href: string;
};

function getInstitutionActions(institution: InstitutionSummary): InstitutionAction[] {
  const detailHref = `/platform/institutions/${institution.id}`;

  if (!institution.active) {
    return [{ label: "Ver", href: detailHref }];
  }

  return [
    { label: "Ver", href: detailHref },
    { label: "Editar", href: `${detailHref}/edit` },
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
    <Link href={`/platform/institutions/${institution.id}/people`} className="inline-flex items-center">
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
  isPending: boolean;
  onStatusChange: () => void;
};

function InstitutionActionsMenu({
  institution,
  isPending,
  onStatusChange,
}: InstitutionActionsMenuProps): React.ReactElement {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Abrir acciones de ${institution.name}`} disabled={isPending}>
            {isPending ? <Loader2Icon className="animate-spin" /> : <EllipsisVerticalIcon />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 p-1.5">
          <DropdownMenuGroup>
            {getInstitutionActions(institution).map((action) => (
              <DropdownMenuItem key={action.href} asChild>
                <Link href={action.href} className="px-2.5 py-1.5">
                  {action.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant={institution.active ? "destructive" : "default"}
            className="px-2.5 py-1.5"
            disabled={isPending}
            onSelect={onStatusChange}
          >
            {getStatusActionLabel(institution.active, isPending)}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function getStatusActionLabel(active: boolean, isPending: boolean): string {
  if (isPending) return active ? "Desactivando..." : "Activando...";

  return active ? "Desactivar" : "Activar";
}
