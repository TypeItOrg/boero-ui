import Link from "next/link";
import { FingerprintIcon, PlusIcon, SearchIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { PlatformAccountAdmin } from "@features/platform-accounts/types/platform-account-admin.types";

type PlatformAccountsEmptyStateProps = {
  data: PaginatedResponse<PlatformAccountAdmin>;
  search: string;
  enabled: boolean | undefined;
  size: number;
};

export function PlatformAccountsEmptyState({ data, search, enabled, size }: PlatformAccountsEmptyStateProps): React.ReactElement {
  const hasFilters = search.trim() !== "" || enabled !== undefined;

  if (data.totalItems > 0) {
    return (
      <div className="bg-muted/25 text-muted-foreground flex h-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
        <div className="bg-background border-border/50 text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full border shadow-sm">
          <FingerprintIcon className="size-5" />
        </div>
        <h3 className="text-foreground text-base font-semibold">No hay administradores en esta página</h3>
        <p className="text-muted-foreground mt-1.5 mb-6 max-w-sm text-sm">
          La página seleccionada no contiene elementos. Podés volver a la primera página para ver los resultados.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/accounts?size=${size}`}>Volver a la primera página</Link>
        </Button>
      </div>
    );
  }

  if (hasFilters) {
    return (
      <div className="bg-muted/25 text-muted-foreground flex h-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
        <div className="bg-background border-border/50 text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full border shadow-sm">
          <SearchIcon className="size-5" />
        </div>
        <h3 className="text-foreground text-base font-semibold">No se encontraron resultados</h3>
        <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
          No encontramos ningún administrador que coincida con los criterios de búsqueda seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-muted/25 text-muted-foreground flex h-full flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
      <div className="bg-background border-border/50 text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full border shadow-sm">
        <FingerprintIcon className="size-5" />
      </div>
      <h3 className="text-foreground text-base font-semibold">No hay administradores</h3>
      <p className="text-muted-foreground mt-1.5 mb-6 max-w-sm text-sm">
        Comenzá creando un nuevo administrador para empezar a gestionar la plataforma.
      </p>
      <Button asChild size="sm">
        <ReturnToLink href="/admin/accounts/new">
          <PlusIcon className="mr-2 size-4" />
          Nuevo administrador
        </ReturnToLink>
      </Button>
    </div>
  );
}
