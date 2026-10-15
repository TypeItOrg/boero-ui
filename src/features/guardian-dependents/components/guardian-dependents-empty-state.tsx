import type { ReactElement } from "react";

import { SearchIcon, UsersIcon } from "lucide-react";

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { DATA_TABLE_EMPTY_MESSAGES } from "@common/constants/data-table-empty.constants";

export function GuardianDependentsEmptyState({ hasFilters }: { hasFilters: boolean }): ReactElement {
  const Icon = hasFilters ? SearchIcon : UsersIcon;

  return (
    <Empty className="bg-muted/25 h-full min-h-80 rounded-lg border border-solid px-4 py-12">
      <EmptyHeader className="max-w-md">
        <EmptyMedia variant="icon">
          <Icon aria-hidden="true" className="size-5" />
        </EmptyMedia>
        <EmptyTitle className="mt-2 text-base">{hasFilters ? "No se encontraron personas a cargo" : "No hay personas a cargo"}</EmptyTitle>
        <EmptyDescription>
          {hasFilters
            ? DATA_TABLE_EMPTY_MESSAGES.FILTERED_DESCRIPTION
            : "Todavía no tenés ninguna persona a cargo. Solicitá la vinculación con tu primera persona para comenzar sus inscripciones."}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
