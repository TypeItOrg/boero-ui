import { Suspense } from "react";
import { Building2Icon } from "lucide-react";

import { PlatformDashboardContent } from "@features/platform-dashboard/components/platform-dashboard-content";
import { PlatformDashboardErrorBoundary } from "@features/platform-dashboard/components/platform-dashboard-error";
import { PlatformDashboardSkeleton } from "@features/platform-dashboard/components/platform-dashboard-skeleton";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export const metadata = {
  title: "Inicio",
  description: "Resumen general de la actividad de la plataforma.",
};

export default function PlatformPage(): React.ReactElement {
  return (
    <PlatformPageShell
      title="Inicio"
      description="Una vista general del alcance y la actividad de la plataforma."
      contentVariant="plain"
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={
        <div className="from-primary to-primary/80 text-primary-foreground flex h-full items-center justify-center rounded-2xl bg-linear-to-br px-4 shadow-xs">
          <Building2Icon className="size-6 sm:size-7" />
        </div>
      }
    >
      <Suspense fallback={<PlatformDashboardSkeleton />}>
        <PlatformDashboardErrorBoundary>
          <PlatformDashboardContent />
        </PlatformDashboardErrorBoundary>
      </Suspense>
    </PlatformPageShell>
  );
}
