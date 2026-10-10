"use client";

import type { ElementType, ReactElement } from "react";

import { DataTableEmptyStateActions } from "@common/components/ui/data-table-empty-state-actions";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { getDataTableEmptyContent } from "@common/utils/data-table-empty-content.util";

export function DocumentCatalogEmptyState({
  EmptyIcon,
  hasItemsOnOtherPages,
  hasFilters,
  canManage,
  navigate,
}: {
  EmptyIcon: ElementType;
  hasItemsOnOtherPages: boolean;
  hasFilters: boolean;
  canManage: boolean;
  navigate: (changes: Record<string, string | undefined>) => void;
}): ReactElement {
  const emptyContent = getDataTableEmptyContent({
    hasItemsOnOtherPages,
    hasFilters,
    pageTitle: "No hay documentos en esta página",
    filteredTitle: "No se encontraron documentos",
    emptyTitle: "Sin documentos para mostrar",
    filteredDescription: "Probá con otro nombre o cambiá los filtros.",
    emptyDescription: canManage ? "Creá un documento para configurarlo en los trayectos." : "Todavía no hay documentos para mostrar en esta vista.",
  });

  return (
    <Empty className="bg-muted/25 h-full min-h-80 rounded-lg border border-solid px-4 py-12">
      <EmptyHeader className="max-w-md">
        <EmptyMedia variant="icon">
          <EmptyIcon className="size-5" aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle className="mt-2 text-base">{emptyContent.title}</EmptyTitle>
        <EmptyDescription>{emptyContent.description}</EmptyDescription>
      </EmptyHeader>
      <DataTableEmptyStateActions hasFilters={hasFilters} hasItemsOnOtherPages={hasItemsOnOtherPages} onFirstPage={() => navigate({ page: "0" })} />
    </Empty>
  );
}
