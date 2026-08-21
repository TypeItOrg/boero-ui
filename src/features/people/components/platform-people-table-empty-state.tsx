import * as React from "react";
import { SearchIcon, UsersIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { PlatformPersonSummary } from "@features/people/types/platform-person-summary.types";

type PlatformPeopleEmptyStateProps = {
  data: PaginatedResponse<PlatformPersonSummary>;
  hasFilters: boolean;
  onFirstPage: () => void;
};

export function PlatformPeopleEmptyState({ data, hasFilters, onFirstPage }: PlatformPeopleEmptyStateProps): React.ReactElement {
  if (data.totalItems > 0) {
    return (
      <EmptyState
        icon={<UsersIcon className="size-5" />}
        title="No hay usuarios en esta página"
        description="La página seleccionada no contiene elementos. Podés volver a la primera página para ver los resultados."
        action={
          <Button type="button" variant="outline" size="sm" onClick={onFirstPage}>
            Volver a la primera página
          </Button>
        }
      />
    );
  }

  if (hasFilters) {
    return (
      <EmptyState
        icon={<SearchIcon className="size-5" />}
        title="No se encontraron resultados"
        description="No encontramos usuarios que coincidan con los criterios de búsqueda seleccionados."
      />
    );
  }

  return (
    <EmptyState
      icon={<UsersIcon className="size-5" />}
      title="No hay usuarios registrados"
      description="Todavía no hay usuarios cargados en las instituciones de la plataforma."
    />
  );
}

function EmptyState({
  action,
  description,
  icon,
  title,
}: {
  action?: React.ReactNode;
  description: string;
  icon: React.ReactNode;
  title: string;
}): React.ReactElement {
  return (
    <div className="bg-muted/25 text-muted-foreground flex h-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
      <div className="bg-background border-border/50 text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full border shadow-sm">
        {icon}
      </div>
      <h3 className="text-foreground text-base font-semibold">{title}</h3>
      <p className={`text-muted-foreground mt-1.5 max-w-sm text-sm${action ? "mb-6" : ""}`}>{description}</p>
      {action}
    </div>
  );
}
