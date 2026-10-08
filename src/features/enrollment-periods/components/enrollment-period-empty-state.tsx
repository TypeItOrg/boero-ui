import { CalendarRangeIcon, SearchIcon } from "lucide-react";

import { DataTableEmptyStateActions } from "@common/components/ui/data-table-empty-state-actions";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { DATA_TABLE_EMPTY_MESSAGES } from "@common/constants/data-table-empty.constants";

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
    description = DATA_TABLE_EMPTY_MESSAGES.FILTERED_DESCRIPTION;
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
      <DataTableEmptyStateActions
        createAction={createAction}
        hasFilters={hasFilters}
        hasItemsOnOtherPages={hasItemsOnOtherPages}
        onFirstPage={onFirstPage}
      />
    </Empty>
  );
}
