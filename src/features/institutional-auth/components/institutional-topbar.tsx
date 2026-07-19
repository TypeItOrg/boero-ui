import { SearchIcon } from "lucide-react";

import { Input } from "@common/components/ui/input";
import { SidebarTrigger } from "@common/components/ui/sidebar";

export function InstitutionalTopbar(): React.ReactElement {
  return (
    <header className="bg-muted flex h-16 shrink-0 items-center justify-between gap-3 rounded-xl px-3 sm:px-4 md:gap-6">
      <SidebarTrigger
        aria-label="Cambiar estado de la barra lateral"
        className="bg-background hover:bg-accent size-9 shrink-0 rounded-lg shadow-xs"
      />
      <div className="relative w-full max-w-sm">
        <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          aria-label="Buscar"
          placeholder="Buscar..."
          disabled
          className="bg-background h-9 w-full rounded-lg border-0 pl-9 shadow-xs"
        />
      </div>
    </header>
  );
}
