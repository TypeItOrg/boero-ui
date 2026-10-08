import { RouteIcon } from "lucide-react";

import { DataTableEmptyStateActions } from "@common/components/ui/data-table-empty-state-actions";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { DATA_TABLE_EMPTY_MESSAGES } from "@common/constants/data-table-empty.constants";

export function DocumentCatalogAssignmentsEmptyState({
  withinReadScope = false,
  hasItemsOnOtherPages = false,
  onFirstPage,
}: {
  withinReadScope?: boolean;
  hasItemsOnOtherPages?: boolean;
  onFirstPage?: () => void;
}): React.ReactElement {
  const title = hasItemsOnOtherPages ? "No hay trayectos en esta página" : "Sin trayectos asignados";
  const description = hasItemsOnOtherPages
    ? DATA_TABLE_EMPTY_MESSAGES.PAGE_DESCRIPTION
    : `No hay trayectos asignados a este documento${withinReadScope ? " dentro de tu alcance de lectura" : ""}.`;

  return (
    <Empty className="min-h-64 px-4 py-8" role="status">
      <EmptyHeader className="max-w-md">
        <EmptyMedia variant="icon">
          <RouteIcon className="size-5" aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle className="mt-2 text-base">{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {hasItemsOnOtherPages && onFirstPage ? <DataTableEmptyStateActions hasFilters hasItemsOnOtherPages onFirstPage={onFirstPage} /> : null}
    </Empty>
  );
}
