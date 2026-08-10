import * as React from "react";
import Link from "next/link";
import { Loader2Icon, PlusIcon, SearchIcon, UserIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Button } from "@common/components/ui/button";
import type { PaginationQuery } from "@common/types/pagination-query.types";
import { PeopleScope, type PeopleScope as PeopleScopeType } from "@features/people/utils/people-scope.util";

type PeopleTableEmptyStateProps = Pick<PaginationQuery, "search" | "size"> & {
  canCreate: boolean;
  institutionId: string;
  isNavigating: boolean;
  scope: PeopleScopeType;
  totalItems: number;
};

export function PeopleTableEmptyState({
  canCreate,
  institutionId,
  isNavigating,
  scope,
  search,
  size,
  totalItems,
}: PeopleTableEmptyStateProps): React.ReactElement {
  let content: React.ReactNode;

  if (totalItems > 0) {
    content = (
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
              PeopleScope.isInstitutional(scope)
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
    content = (
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
    content = (
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
            <ReturnToLink
              href={
                PeopleScope.isInstitutional(scope) ? "/people/new" : `/admin/institutions/${institutionId}/people/new`
              }
            >
              <PlusIcon className="mr-2 size-4" />
              Nuevo usuario
            </ReturnToLink>
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative h-full" aria-busy={isNavigating}>
      {content}
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
