"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EllipsisVerticalIcon, Loader2Icon, PlusIcon, SearchIcon, UserIcon } from "lucide-react";

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
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@common/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { PaginationQuery } from "@common/types/pagination.types";
import type { PersonSummary } from "../types/person.types";
import type { PeopleSort, PeopleSortField } from "../utils/people-pagination.util";
import type { PeopleScope } from "../utils/people-scope.util";
import { PeoplePagination } from "./people-pagination";
import { PersonDeleteDialog } from "./person-delete-dialog";
import { PersonStatusDialog } from "./person-status-dialog";

type PeopleTablePresentationProps = PaginationQuery & {
  data: PaginatedResponse<PersonSummary>;
  institutionId: string;
  sort: PeopleSort;
  scope?: PeopleScope;
  selfPersonId?: string | null;
  canCreate?: boolean;
  canDelete?: boolean;
  canUpdateStatus?: boolean;
};

export function PeopleTablePresentation({
  data,
  institutionId,
  page,
  size,
  search,
  sort,
  scope = "admin",
  selfPersonId,
  canCreate = true,
  canDelete = true,
  canUpdateStatus = false,
}: PeopleTablePresentationProps): React.ReactElement {
  const router = useRouter();
  const { isPending: isNavigating, navigate } = useDataTableNavigation();
  const [personToDelete, setPersonToDelete] = useState<PersonSummary>();
  const [personToUpdateStatus, setPersonToUpdateStatus] = useState<PersonSummary>();

  function handleDeleteDialogOpenChange(open: boolean): void {
    if (!open) setPersonToDelete(undefined);
  }

  function handlePersonDeleted(): void {
    setPersonToDelete(undefined);
    router.refresh();
  }

  function handleStatusDialogOpenChange(open: boolean): void {
    if (!open) setPersonToUpdateStatus(undefined);
  }

  function handleStatusUpdated(): void {
    setPersonToUpdateStatus(undefined);
    router.refresh();
  }

  function updateSort(nextSort: PeopleSort): void {
    navigate({ page: "0", sortField: nextSort.field, sortDirection: nextSort.direction });
  }

  if (data.items.length === 0) {
    let emptyStateContent: React.ReactNode;

    if (data.totalItems > 0) {
      emptyStateContent = (
        <div className="bg-muted/25 text-muted-foreground flex h-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
          <div className="bg-background border-border/50 text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full border shadow-sm">
            <UserIcon className="size-5" />
          </div>
          <h3 className="text-foreground text-base font-semibold">No hay usuarios en esta página</h3>
          <p className="text-muted-foreground mt-1.5 mb-6 max-w-sm text-sm">
            La página seleccionada no contiene elementos. Podés volver a la primera página para ver los resultados.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link
              href={
                scope === "institutional"
                  ? `/people?size=${size}`
                  : `/admin/institutions/${institutionId}/people?size=${size}`
              }
            >
              Volver a la primera página
            </Link>
          </Button>
        </div>
      );
    } else if (search.trim() !== "") {
      emptyStateContent = (
        <div className="bg-muted/25 text-muted-foreground flex h-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
          <div className="bg-background border-border/50 text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full border shadow-sm">
            <SearchIcon className="size-5" />
          </div>
          <h3 className="text-foreground text-base font-semibold">No se encontraron resultados</h3>
          <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
            No encontramos ningún usuario que coincida con los criterios de búsqueda seleccionados.
          </p>
        </div>
      );
    } else {
      emptyStateContent = (
        <div className="bg-muted/25 text-muted-foreground flex h-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
          <div className="bg-background border-border/50 text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full border shadow-sm">
            <UserIcon className="size-5" />
          </div>
          <h3 className="text-foreground text-base font-semibold">No hay usuarios registrados</h3>
          <p className={`text-muted-foreground mt-1.5 max-w-sm text-sm ${canCreate ? "mb-6" : ""}`}>
            {canCreate
              ? "Comenzá creando un nuevo usuario para esta institución."
              : "Todavía no hay usuarios registrados en esta institución."}
          </p>
          {canCreate ? (
            <Button asChild size="sm">
              <Link
                href={scope === "institutional" ? "/people/new" : `/admin/institutions/${institutionId}/people/new`}
              >
                <PlusIcon className="mr-2 size-4" />
                Nuevo usuario
              </Link>
            </Button>
          ) : null}
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
              aria-label="Cargando usuarios"
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
        <Table containerClassName="table-scrollbar" className="min-w-190">
          <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
            <TableRow className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
              <DataTableSortableHead<PeopleSortField>
                field="lastName"
                label="Nombre"
                sort={sort}
                onSortChange={updateSort}
              />
              <DataTableSortableHead<PeopleSortField>
                field="documentNumber"
                label="Documento"
                sort={sort}
                onSortChange={updateSort}
              />
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              {scope === "institutional" ? <TableHead>Estado</TableHead> : null}
              <TableHead>Rol</TableHead>
              <TableHead className="w-16">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((person) => {
              const isSelf = person.id === selfPersonId;
              const canDeletePerson = canDelete && !isSelf;
              const canUpdatePersonStatus = canUpdateStatus && !isSelf;

              return (
                <ContextMenu key={person.id}>
                  <ContextMenuTrigger asChild>
                    <TableRow className="hover:bg-muted/50 border-b transition-colors">
                      <TableCell className="font-medium">
                        <Link
                          className="hover:underline"
                          href={getPersonHref(scope, institutionId, person.id, selfPersonId)}
                        >
                          {person.lastName}, {person.firstName}
                        </Link>
                      </TableCell>
                      <TableCell>{person.documentNumber}</TableCell>
                      <TableCell>
                        {person.phoneNumber ? (
                          person.phoneNumber
                        ) : (
                          <span className="text-muted-foreground/60">Sin teléfono</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {person.email ? person.email : <span className="text-muted-foreground/60">Sin email</span>}
                      </TableCell>
                      {scope === "institutional" ? (
                        <TableCell>
                          <Badge variant={person.enabled ? "secondary" : "outline"}>
                            {person.enabled ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                      ) : null}
                      <TableCell>
                        {person.roles && person.roles.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {person.roles.map((role) => (
                              <Badge key={role.roleCode} variant="secondary">
                                {role.displayName}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60">Sin rol</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <PersonActionsMenu
                          person={person}
                          institutionId={institutionId}
                          scope={scope}
                          isSelf={isSelf}
                          canDelete={canDeletePerson}
                          canUpdateStatus={canUpdatePersonStatus}
                          onDelete={() => setPersonToDelete(person)}
                          onUpdateStatus={() => setPersonToUpdateStatus(person)}
                        />
                      </TableCell>
                    </TableRow>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-44 p-1.5">
                    <ContextMenuItem asChild>
                      <Link
                        href={getPersonHref(scope, institutionId, person.id, selfPersonId)}
                        className="px-2.5 py-1.5"
                      >
                        Editar
                      </Link>
                    </ContextMenuItem>
                    {canDeletePerson ? (
                      <>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                          variant="destructive"
                          className="px-2.5 py-1.5"
                          onSelect={() => setPersonToDelete(person)}
                        >
                          Eliminar
                        </ContextMenuItem>
                      </>
                    ) : null}
                    {canUpdatePersonStatus ? (
                      <>
                        <ContextMenuSeparator />
                        <ContextMenuItem className="px-2.5 py-1.5" onSelect={() => setPersonToUpdateStatus(person)}>
                          {person.enabled ? "Desactivar acceso" : "Activar acceso"}
                        </ContextMenuItem>
                      </>
                    ) : null}
                  </ContextMenuContent>
                </ContextMenu>
              );
            })}
          </TableBody>
        </Table>

        {isNavigating && (
          <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px]">
            <Loader2Icon
              className="text-muted-foreground size-5 animate-spin"
              aria-label="Cargando usuarios"
              role="status"
            />
          </div>
        )}
      </div>

      <PeoplePagination page={page} size={size} totalItems={data.totalItems} totalPages={data.totalPages} />

      {personToDelete ? (
        <PersonDeleteDialog
          institutionId={institutionId}
          scope={scope}
          personId={personToDelete.id}
          personName={`${personToDelete.firstName} ${personToDelete.lastName}`}
          open
          onOpenChange={handleDeleteDialogOpenChange}
          onDeleted={handlePersonDeleted}
        />
      ) : null}

      {personToUpdateStatus ? (
        <PersonStatusDialog
          institutionId={institutionId}
          personId={personToUpdateStatus.id}
          personName={`${personToUpdateStatus.firstName} ${personToUpdateStatus.lastName}`}
          enabled={personToUpdateStatus.enabled}
          open
          onOpenChange={handleStatusDialogOpenChange}
          onUpdated={handleStatusUpdated}
        />
      ) : null}
    </div>
  );
}

type PersonActionsMenuProps = {
  person: PersonSummary;
  institutionId: string;
  onDelete: () => void;
  scope: PeopleScope;
  isSelf: boolean;
  canDelete: boolean;
  canUpdateStatus: boolean;
  onUpdateStatus: () => void;
};

function PersonActionsMenu({
  person,
  institutionId,
  onDelete,
  scope,
  isSelf,
  canDelete,
  canUpdateStatus,
  onUpdateStatus,
}: PersonActionsMenuProps): React.ReactElement {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Abrir acciones de ${person.firstName} ${person.lastName}`}>
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 p-1.5">
          <DropdownMenuItem asChild>
            <Link
              href={getPersonHref(scope, institutionId, person.id, isSelf ? person.id : undefined)}
              className="px-2.5 py-1.5"
            >
              Editar
            </Link>
          </DropdownMenuItem>
          {canUpdateStatus ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="px-2.5 py-1.5" onSelect={onUpdateStatus}>
                {person.enabled ? "Desactivar acceso" : "Activar acceso"}
              </DropdownMenuItem>
            </>
          ) : null}
          {canDelete ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" className="px-2.5 py-1.5" onSelect={onDelete}>
                Eliminar
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function getPersonHref(
  scope: PeopleScope,
  institutionId: string,
  personId: string,
  selfPersonId?: string | null,
): string {
  if (scope === "institutional" && personId === selfPersonId) return "/profile";
  return scope === "institutional" ? `/people/${personId}` : `/admin/institutions/${institutionId}/people/${personId}`;
}
