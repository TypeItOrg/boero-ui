import { Suspense } from "react";
import { Building2Icon } from "lucide-react";

import { PlatformDashboardContent } from "@features/platform-dashboard/components/platform-dashboard-content";
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
      headerClassName="flex-row items-center justify-between md:items-center"
      actions={
        <div className="from-primary to-primary/80 text-primary-foreground flex size-14 items-center justify-center rounded-xl bg-gradient-to-br shadow-xs sm:size-[60px]">
          <Building2Icon className="size-7 sm:size-8" />
        </div>
      }
    >
      <Suspense fallback={<PlatformDashboardSkeleton />}>
        <PlatformDashboardContent />
      </Suspense>
    </PlatformPageShell>
  );
}
