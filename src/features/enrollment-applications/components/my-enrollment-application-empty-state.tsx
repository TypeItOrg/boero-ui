"use client";

import Link from "next/link";
import { ClipboardListIcon, SearchIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { EmptyMedia } from "@common/components/ui/empty";

type MyEnrollmentApplicationEmptyStateProps = {
  hasFilter: boolean;
  isNavigating: boolean;
  size: number;
  totalItems: number;
};

export function MyEnrollmentApplicationEmptyState({
  hasFilter,
  isNavigating,
  size,
  totalItems,
}: MyEnrollmentApplicationEmptyStateProps): React.ReactElement {
  let content: React.ReactNode;

  if (totalItems > 0) {
    content = (
      <div className="bg-muted/25 text-muted-foreground flex h-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
        <EmptyMedia className="mb-4" variant="icon">
          <ClipboardListIcon className="size-5" />
        </EmptyMedia>
        <h3 className="text-foreground text-base font-semibold">No hay inscripciones en esta página</h3>
        <p className="text-muted-foreground mt-1.5 mb-6 max-w-sm text-sm">
          La página seleccionada no contiene elementos. Podés volver a la primera página para ver los resultados.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href={`/my-enrollment-applications?size=${size}`}>Volver a la primera página</Link>
        </Button>
      </div>
    );
  } else if (hasFilter) {
    content = (
      <div className="bg-muted/25 text-muted-foreground flex h-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
        <EmptyMedia className="mb-4" variant="icon">
          <SearchIcon className="size-5" />
        </EmptyMedia>
        <h3 className="text-foreground text-base font-semibold">No se encontraron inscripciones</h3>
        <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">No encontramos ninguna inscripción que coincida con el estado seleccionado.</p>
      </div>
    );
  } else {
    content = (
      <div className="bg-muted/25 text-muted-foreground flex h-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
        <EmptyMedia className="mb-4" variant="icon">
          <ClipboardListIcon className="size-5" />
        </EmptyMedia>
        <h3 className="text-foreground text-base font-semibold">Aún no iniciaste ninguna inscripción</h3>
        <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
          Las inscripciones que inicies van a aparecer acá junto con su estado de evaluación.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[24rem]" aria-busy={isNavigating}>
      {content}
    </div>
  );
}
