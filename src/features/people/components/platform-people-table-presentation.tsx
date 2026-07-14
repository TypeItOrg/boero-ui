"use client";

import { EllipsisVerticalIcon, Loader2Icon, SearchIcon, UsersIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { NavigationLink } from "@common/components/ui/navigation-link";
import { Button } from "@common/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@common/components/ui/context-menu";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTableSortableHead } from "@common/components/ui/data-table-sortable-head";
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
import { PlatformPeoplePagination } from "@features/people/components/platform-people-pagination";
import type { SystemRoleCode } from "@features/people/types/person-role.types";
import type { PlatformPersonSummary } from "@features/people/types/person.types";
import type {
  PlatformPeopleSort,
  PlatformPeopleSortField,
} from "@features/people/utils/platform-people-pagination.util";

type PlatformPeopleTablePresentationProps = PaginationParams & {
  data: PaginatedResponse<PlatformPersonSummary>;
  institutionId: string | undefined;
  roleCode: SystemRoleCode | undefined;
  search: string;
  sort: PlatformPeopleSort;
};

export function PlatformPeopleTablePresentation({
  data,
  page,
  size,
  institutionId,
  roleCode,
  search,
  sort,
}: PlatformPeopleTablePresentationProps): React.ReactElement {
  const { isPending, navigate } = useDataTableNavigation();

  function updateSort(nextSort: PlatformPeopleSort): void {
    navigate({ page: "0", sortField: nextSort.field, sortDirection: nextSort.direction });
  }

  if (data.items.length === 0) {
    return (
      <PlatformPeopleEmptyState
        data={data}
        hasFilters={search.trim() !== "" || institutionId !== undefined || roleCode !== undefined}
        onFirstPage={() => navigate({ page: "0", size: String(size) })}
      />
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative h-full overflow-hidden rounded-lg border" aria-busy={isPending}>
        <Table containerClassName="table-scrollbar" className="min-w-260">
          <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
            <TableRow>
              <DataTableSortableHead<PlatformPeopleSortField>
                field="lastName"
                label="Nombre"
                sort={sort}
                onSortChange={updateSort}
              />
              <DataTableSortableHead<PlatformPeopleSortField>
                field="documentNumber"
                label="Documento"
                sort={sort}
                onSortChange={updateSort}
              />
              <DataTableSortableHead<PlatformPeopleSortField>
                field="institutionName"
                label="Institución"
                sort={sort}
                onSortChange={updateSort}
              />
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="w-16 pr-4">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((person) => (
              <ContextMenu key={person.id}>
                <ContextMenuTrigger asChild>
                  <TableRow>
                    <TableCell className="font-medium">
                      <NavigationLink className="hover:underline" href={getPersonPath(person)}>
                        {person.lastName}, {person.firstName}
                      </NavigationLink>
                    </TableCell>
                    <TableCell>{person.documentNumber}</TableCell>
                    <TableCell>
                      <NavigationLink
                        className="text-muted-foreground font-medium hover:underline"
                        href={getInstitutionPath(person)}
                      >
                        {person.institutionName}
                      </NavigationLink>
                    </TableCell>
                    <TableCell>
                      {person.phoneNumber || <span className="text-muted-foreground/60">Sin teléfono</span>}
                    </TableCell>
                    <TableCell>{person.email || <span className="text-muted-foreground/60">Sin email</span>}</TableCell>
                    <TableCell>
                      {person.roles.length ? (
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
                    <TableCell className="pr-4">
                      <PlatformPersonActions person={person} />
                    </TableCell>
                  </TableRow>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-44 p-1.5">
                  <ContextMenuGroup>
                    <ContextMenuItem asChild>
                      <NavigationLink href={getPersonPath(person)} className="px-2.5 py-1.5">
                        Editar usuario
                      </NavigationLink>
                    </ContextMenuItem>
                    <ContextMenuItem asChild>
                      <NavigationLink href={getInstitutionPath(person)} className="px-2.5 py-1.5">
                        Ver institución
                      </NavigationLink>
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
              aria-label="Cargando usuarios"
              role="status"
            />
          </div>
        ) : null}
      </div>

      <PlatformPeoplePagination
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

function PlatformPersonActions({ person }: { person: PlatformPersonSummary }): React.ReactElement {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Abrir acciones de ${person.firstName} ${person.lastName}`}>
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 p-1.5">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <NavigationLink href={getPersonPath(person)} className="px-2.5 py-1.5">
                Editar usuario
              </NavigationLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <NavigationLink href={getInstitutionPath(person)} className="px-2.5 py-1.5">
                Ver institución
              </NavigationLink>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

type PlatformPeopleEmptyStateProps = {
  data: PaginatedResponse<PlatformPersonSummary>;
  hasFilters: boolean;
  onFirstPage: () => void;
};

function PlatformPeopleEmptyState({
  data,
  hasFilters,
  onFirstPage,
}: PlatformPeopleEmptyStateProps): React.ReactElement {
  if (data.totalItems > 0) {
    return (
      <EmptyState
        icon={<UsersIcon className="size-5" />}
        title="No hay usuarios en esta página"
        description="La página seleccionada no contiene elementos. Podés volver a la primera página para ver los resultados."
        action={
          <Button type="button" variant="outline" size="sm" onClick={onFirstPage}>
            Volver a la primera página
          </Button>
        }
      />
    );
  }

  if (hasFilters) {
    return (
      <EmptyState
        icon={<SearchIcon className="size-5" />}
        title="No se encontraron resultados"
        description="No encontramos usuarios que coincidan con los criterios de búsqueda seleccionados."
      />
    );
  }

  return (
    <EmptyState
      icon={<UsersIcon className="size-5" />}
      title="No hay usuarios registrados"
      description="Todavía no hay usuarios cargados en las instituciones de la plataforma."
    />
  );
}

type EmptyStateProps = {
  action?: React.ReactNode;
  description: string;
  icon: React.ReactNode;
  title: string;
};

function EmptyState({ action, description, icon, title }: EmptyStateProps): React.ReactElement {
  return (
    <div className="bg-muted/25 text-muted-foreground flex h-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
      <div className="bg-background border-border/50 text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full border shadow-sm">
        {icon}
      </div>
      <h3 className="text-foreground text-base font-semibold">{title}</h3>
      <p className={`text-muted-foreground mt-1.5 max-w-sm text-sm${action ? "mb-6" : ""}`}>{description}</p>
      {action}
    </div>
  );
}

function getPersonPath(person: PlatformPersonSummary): string {
  return `/platform/institutions/${person.institutionId}/people/${person.id}`;
}

function getInstitutionPath(person: PlatformPersonSummary): string {
  return `/platform/institutions/${person.institutionId}`;
}
