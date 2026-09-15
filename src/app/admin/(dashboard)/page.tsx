import { Suspense } from "react";
import { Building2Icon } from "lucide-react";

import { PlatformDashboardContent } from "@features/platform-dashboard/components/platform-dashboard-content";
import { PlatformDashboardErrorBoundary } from "@features/platform-dashboard/components/platform-dashboard-error";
import { PlatformDashboardSkeleton } from "@features/platform-dashboard/components/platform-dashboard-skeleton";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";

export const metadata = {
  title: "Inicio",
  description: "Resumen general de la actividad de la plataforma.",
};

export default function PlatformPage(): React.ReactElement {
  return (
    <PlatformPageShell
      title="Inicio"
      contentVariant="plain"
      headerClassName="flex-row items-center justify-between lg:items-center"
      actionsClassName="self-stretch"
      actions={<PlatformPageIcon icon={Building2Icon} />}
    >
      <Suspense fallback={<PlatformDashboardSkeleton />}>
        <PlatformDashboardErrorBoundary>
          <PlatformDashboardContent />
        </PlatformDashboardErrorBoundary>
      </Suspense>
    </PlatformPageShell>
  );
}
