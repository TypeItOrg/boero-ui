import { CalendarRangeIcon, SearchIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";

type EnrollmentPeriodEmptyStateProps = {
  createAction?: React.ReactNode;
  hasFilters: boolean;
  hasItemsOnOtherPages: boolean;
  onFirstPage: () => void;
};

export function EnrollmentPeriodEmptyState({
  createAction,
  hasFilters,
  hasItemsOnOtherPages,
  onFirstPage,
}: EnrollmentPeriodEmptyStateProps): React.ReactElement {
  const Icon = hasFilters ? SearchIcon : CalendarRangeIcon;
  let title = "No hay períodos de inscripción";
  let description = "Creá un período de inscripción para definir cuándo se reciben nuevas solicitudes de estudiantes.";

  if (hasItemsOnOtherPages) {
    title = "No hay períodos en esta página";
    description = "Volvé a la primera página para ver los períodos de inscripción disponibles.";
  } else if (hasFilters) {
    title = "No se encontraron períodos";
    description = "No encontramos períodos de inscripción que coincidan con los filtros aplicados.";
  }

  return (
    <Empty className="bg-muted/25 h-full min-h-80 rounded-lg border border-solid px-4 py-12">
      <EmptyHeader className="max-w-md">
        <EmptyMedia variant="icon">
          <Icon className="size-5" aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle className="mt-2 text-base">{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {createAction}
        {hasItemsOnOtherPages ? (
          <Button type="button" variant="outline" size="lg" onClick={onFirstPage}>
            Volver a la primera página
          </Button>
        ) : null}
      </div>
    </Empty>
  );
}
