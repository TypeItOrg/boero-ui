"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2Icon, SearchIcon, UserIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { EmptyMedia } from "@common/components/ui/empty";
import type { PaginationQuery } from "@common/types/pagination-query.types";

type TeachersTableEmptyStateProps = Pick<PaginationQuery, "search" | "size"> & {
  isNavigating: boolean;
  totalItems: number;
};

export function TeachersTableEmptyState({ isNavigating, search, size, totalItems }: TeachersTableEmptyStateProps): React.ReactElement {
  const isSearchEmpty = search.trim() !== "";
  const content =
    totalItems > 0 ? (
      <>
        <EmptyMedia className="mb-4" variant="icon">
          <UserIcon className="size-5" />
        </EmptyMedia>
        <h3 className="text-foreground text-base font-semibold">No hay docentes en esta página</h3>
        <p className="text-muted-foreground mt-1.5 mb-6 max-w-sm text-sm">La página seleccionada no contiene docentes.</p>
        <Button asChild variant="outline" size="sm">
          <Link href={`/teachers?size=${size}`}>Volver a la primera página</Link>
        </Button>
      </>
    ) : (
      <>
        <EmptyMedia className="mb-4" variant="icon">
          {isSearchEmpty ? <SearchIcon className="size-5" /> : <UserIcon className="size-5" />}
        </EmptyMedia>
        <h3 className="text-foreground text-base font-semibold">{isSearchEmpty ? "No se encontraron docentes" : "No hay docentes registrados"}</h3>
        <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
          {isSearchEmpty ? "No encontramos docentes que coincidan con la búsqueda." : "Todavía no hay docentes asociados a esta institución."}
        </p>
      </>
    );

  return (
    <div className="relative h-full" aria-busy={isNavigating}>
      <div className="bg-muted/25 text-muted-foreground flex h-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
        {content}
      </div>
      {isNavigating ? (
        <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
          <Loader2Icon className="text-muted-foreground size-5 animate-spin" aria-label="Cargando docentes" role="status" />
        </div>
      ) : null}
    </div>
  );
}
