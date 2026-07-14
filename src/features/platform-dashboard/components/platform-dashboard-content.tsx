import { AlertCircleIcon } from "lucide-react";
import { unstable_rethrow } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { PlatformDashboardView } from "@features/platform-dashboard/components/platform-dashboard-view";
import { fetchPlatformDashboard } from "@features/platform-dashboard/services/fetch-platform-dashboard.service";
import type { PlatformDashboard } from "@features/platform-dashboard/types/platform-dashboard.types";

export async function PlatformDashboardContent(): Promise<React.ReactElement> {
  let dashboard: PlatformDashboard;

  try {
    dashboard = await fetchPlatformDashboard();
  } catch (error) {
    unstable_rethrow(error);
    console.error("[Platform dashboard] Failed to load dashboard", error);

    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>No pudimos cargar el resumen</AlertTitle>
        <AlertDescription>
          La información de la plataforma no está disponible en este momento. Intentá nuevamente recargando la página.
        </AlertDescription>
      </Alert>
    );
  }

  return <PlatformDashboardView dashboard={dashboard} />;
}
