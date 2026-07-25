import { Skeleton } from "@common/components/ui/skeleton";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export function InstitutionalRouteSkeleton(): React.ReactElement {
  return (
    <div className="flex h-full min-h-0 flex-1" role="status" aria-label="Cargando contenido">
      <PlatformPageShell
        title={<Skeleton className="h-8 w-44 sm:h-9 sm:w-56" />}
        description={<Skeleton className="h-4 w-72 max-w-full" />}
        breadcrumb={
          <div className="flex items-center gap-2" aria-hidden="true">
            <Skeleton className="h-4 w-12" />
            <span className="text-muted-foreground">›</span>
            <Skeleton className="h-4 w-20" />
          </div>
        }
        actions={<Skeleton className="h-12 w-28" />}
        minViewportHeight
      >
        <div className="min-h-0 flex-1" aria-hidden="true" />
      </PlatformPageShell>
    </div>
  );
}
