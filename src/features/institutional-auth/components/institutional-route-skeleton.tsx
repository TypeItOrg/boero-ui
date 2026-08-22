import { Skeleton } from "@common/components/ui/skeleton";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export function InstitutionalRouteSkeleton(): React.ReactElement {
  return (
    <div className="flex h-full min-h-0 flex-1" role="status" aria-label="Cargando contenido">
      <PlatformPageShell title={<Skeleton className="h-8 w-44 sm:h-8 sm:w-56" />} breadcrumb={<Skeleton className="h-5 w-32" />} minViewportHeight>
        <Skeleton className="min-h-0 flex-1" />
      </PlatformPageShell>
    </div>
  );
}
