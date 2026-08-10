"use client";

import Link from "next/link";
import { KeyRoundIcon, Loader2Icon, SearchIcon, UserLockIcon, UsersIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@common/components/ui/card";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { InstitutionRolesPagination } from "@features/roles/components/institution-roles-pagination";
import type { InstitutionRole } from "@features/roles/types/institution-role.types";

type InstitutionRolesTablePresentationProps = {
  roles: PaginatedResponse<InstitutionRole>;
  search: string;
  canUpdate: boolean;
};

export function InstitutionRolesTablePresentation({
  roles,
  search,
  canUpdate,
}: InstitutionRolesTablePresentationProps): React.ReactElement {
  const { isPending } = useDataTableNavigation();

  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="relative flex flex-1 flex-col gap-4" aria-busy={isPending}>
        {roles.items.length > 0 ? (
          <div className="flex flex-wrap items-start gap-4">
            {roles.items.map((role) => (
              <Card key={role.id} className="bg-muted/25 flex-[1_0_min(450px,100%)] overflow-hidden">
                <CardHeader className="flex-row items-center gap-3">
                  <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                    <UserLockIcon className="size-5" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="truncate">{role.name}</CardTitle>
                      {role.technicalCode ? (
                        <Badge variant="secondary">Sistema</Badge>
                      ) : (
                        <Badge variant="outline">Personalizado</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <div className="bg-background/70 flex items-center gap-2 rounded-lg border p-3">
                    <UsersIcon className="text-muted-foreground size-4" />
                    <span className="text-sm font-medium">
                      {role.assignmentCount} {role.assignmentCount === 1 ? "usuario" : "usuarios"}
                    </span>
                  </div>
                  <div className="bg-background/70 flex items-center gap-2 rounded-lg border p-3">
                    <KeyRoundIcon className="text-muted-foreground size-4" />
                    <span className="text-sm font-medium">
                      {role.permissions.length} {role.permissions.length === 1 ? "permiso" : "permisos"}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="bg-background/50 flex items-center justify-end gap-2 border-t">
                  {canUpdate && role.editable ? (
                    <Button asChild variant="ghost" size="lg">
                      <ReturnToLink href={`/roles/${role.id}/edit`}>Editar</ReturnToLink>
                    </Button>
                  ) : (
                    <Button disabled variant="ghost" size="lg">
                      Editar
                    </Button>
                  )}
                  <Button asChild size="lg">
                    <Link href={`/roles/${role.id}`}>Ver detalle</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-muted/25 text-muted-foreground flex h-full flex-1 flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
            <div className="bg-background border-border/50 text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full border shadow-sm">
              <SearchIcon className="size-5" />
            </div>
            <h3 className="text-foreground text-base font-semibold">
              {search.trim() !== "" ? "No se encontraron resultados" : "No hay roles registrados"}
            </h3>
            <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
              {search.trim() !== ""
                ? "No encontramos ningún rol que coincida con los criterios de búsqueda seleccionados."
                : "Todavía no hay roles cargados en esta institución."}
            </p>
          </div>
        )}

        {isPending ? (
          <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
            <Loader2Icon
              className="text-muted-foreground size-5 animate-spin"
              aria-label="Cargando roles"
              role="status"
            />
          </div>
        ) : null}
      </div>

      <InstitutionRolesPagination
        page={roles.page}
        size={roles.size}
        totalItems={roles.totalItems}
        totalPages={roles.totalPages}
      />
    </div>
  );
}
