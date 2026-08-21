import * as React from "react";
import { SearchIcon, ShieldCheckIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { PlatformRoleListItem } from "@features/roles/types/platform-role-list-item.types";

type PlatformRolesEmptyStateProps = {
  data: PaginatedResponse<PlatformRoleListItem>;
  hasFilters: boolean;
  onFirstPage: () => void;
};

export function PlatformRolesEmptyState({ data, hasFilters, onFirstPage }: PlatformRolesEmptyStateProps): React.ReactElement {
  if (data.totalItems > 0) {
    return (
      <div className="bg-muted/25 text-muted-foreground flex h-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
        <ShieldCheckIcon className="mb-4 size-8" />
        <h3 className="text-foreground text-base font-semibold">No hay roles en esta página</h3>
        <p className="mt-1.5 max-w-sm text-sm">Podés volver a la primera página para ver los resultados.</p>
        <Button type="button" variant="outline" size="sm" className="mt-6" onClick={onFirstPage}>
          Volver a la primera página
        </Button>
      </div>
    );
  }
  const Icon = hasFilters ? SearchIcon : ShieldCheckIcon;
  return (
    <div className="bg-muted/25 text-muted-foreground flex h-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
      <Icon className="mb-4 size-8" />
      <h3 className="text-foreground text-base font-semibold">{hasFilters ? "No se encontraron resultados" : "No hay roles registrados"}</h3>
      <p className="mt-1.5 max-w-sm text-sm">
        {hasFilters ? "No encontramos roles que coincidan con los filtros." : "Todavía no hay roles cargados en las instituciones."}
      </p>
    </div>
  );
}
