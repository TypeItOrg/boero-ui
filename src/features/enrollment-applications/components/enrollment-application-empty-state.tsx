import Link from "next/link";
import { ENROLLMENT_APPLICATION_FILTER_MESSAGES } from "@features/enrollment-applications/constants/enrollment-application.constants";
import { ClipboardListIcon, SearchIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { EmptyMedia } from "@common/components/ui/empty";

type EnrollmentApplicationEmptyStateProps = {
  hasFilter: boolean;
  isNavigating: boolean;
  size: number;
  totalItems: number;
};

export function EnrollmentApplicationEmptyState({
  hasFilter,
  isNavigating,
  size,
  totalItems,
}: EnrollmentApplicationEmptyStateProps): React.ReactElement {
  let content: React.ReactNode;

  if (totalItems > 0) {
    content = (
      <div className="bg-muted/25 text-muted-foreground flex h-full w-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
        <EmptyMedia className="mb-4" variant="icon">
          <ClipboardListIcon className="size-5" />
        </EmptyMedia>
        <h3 className="text-foreground text-base font-semibold">No hay solicitudes en esta página</h3>
        <p className="text-muted-foreground mt-1.5 mb-6 max-w-sm text-sm">
          La página seleccionada no contiene elementos. Podés volver a la primera página para ver los resultados.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href={`/enrollment-applications?size=${size}`}>Volver a la primera página</Link>
        </Button>
      </div>
    );
  } else if (hasFilter) {
    content = (
      <div className="bg-muted/25 text-muted-foreground flex h-full w-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
        <EmptyMedia className="mb-4" variant="icon">
          <SearchIcon className="size-5" />
        </EmptyMedia>
        <h3 className="text-foreground text-base font-semibold">{ENROLLMENT_APPLICATION_FILTER_MESSAGES.NO_RESULTS_TITLE}</h3>
        <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">{ENROLLMENT_APPLICATION_FILTER_MESSAGES.NO_RESULTS_DESCRIPTION}</p>
      </div>
    );
  } else {
    content = (
      <div className="bg-muted/25 text-muted-foreground flex h-full w-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
        <EmptyMedia className="mb-4" variant="icon">
          <ClipboardListIcon className="size-5" />
        </EmptyMedia>
        <h3 className="text-foreground text-base font-semibold">Aún no hay solicitudes de inscripción</h3>
        <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
          Cuando un postulante inicie una inscripción, aparecerá acá para que la evalúes.
        </p>
      </div>
    );
  }

  return (
    <div
      className="bg-background/45 relative flex h-full min-h-[24rem] items-center justify-center rounded-lg backdrop-blur-[1px]"
      aria-busy={isNavigating}
    >
      {content}
    </div>
  );
}
