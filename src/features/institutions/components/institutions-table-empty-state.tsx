import * as React from "react";
import Link from "next/link";
import { BuildingIcon, Loader2Icon, PlusIcon, SearchIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Button } from "@common/components/ui/button";

type InstitutionsTableEmptyStateProps = {
  active: boolean | undefined;
  isNavigating: boolean;
  search: string;
  size: number;
  totalItems: number;
};

export function InstitutionsTableEmptyState({
  active,
  isNavigating,
  search,
  size,
  totalItems,
}: InstitutionsTableEmptyStateProps): React.ReactElement {
  const hasFilters = search.trim() !== "" || active !== undefined;
  let content: React.ReactNode;

  if (totalItems > 0) {
    content = (
      <EmptyState icon={<BuildingIcon className="size-5" />} title="No hay instituciones en esta página">
        <p className="text-muted-foreground mt-1.5 mb-6 max-w-sm text-sm">
          La página seleccionada no contiene elementos. Podés volver a la primera página para ver los resultados.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/institutions?size=${size}`}>Volver a la primera página</Link>
        </Button>
      </EmptyState>
    );
  } else if (hasFilters) {
    content = (
      <EmptyState icon={<SearchIcon className="size-5" />} title="No se encontraron resultados">
        <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
          No encontramos ninguna institución que coincida con los criterios de búsqueda seleccionados.
        </p>
      </EmptyState>
    );
  } else {
    content = (
      <EmptyState icon={<BuildingIcon className="size-5" />} title="No hay instituciones registradas">
        <p className="text-muted-foreground mt-1.5 mb-6 max-w-sm text-sm">
          Comenzá creando una nueva institución para empezar a gestionar la plataforma.
        </p>
        <Button asChild size="sm">
          <ReturnToLink href="/admin/institutions/new">
            <PlusIcon className="mr-2 size-4" />
            Nueva Institución
          </ReturnToLink>
        </Button>
      </EmptyState>
    );
  }

  return (
    <div className="relative h-full" aria-busy={isNavigating}>
      {content}
      {isNavigating ? (
        <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
          <Loader2Icon className="text-muted-foreground size-5 animate-spin" aria-label="Cargando instituciones" role="status" />
        </div>
      ) : null}
    </div>
  );
}

function EmptyState({ children, icon, title }: React.PropsWithChildren<{ icon: React.ReactNode; title: string }>): React.ReactElement {
  return (
    <div className="bg-muted/25 text-muted-foreground flex h-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
      <div className="bg-background border-border/50 text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full border shadow-sm">
        {icon}
      </div>
      <h3 className="text-foreground text-base font-semibold">{title}</h3>
      {children}
    </div>
  );
}
