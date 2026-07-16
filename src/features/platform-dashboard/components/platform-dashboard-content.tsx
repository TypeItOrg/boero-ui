import { PlatformDashboardView } from "@features/platform-dashboard/components/platform-dashboard-view";
import { fetchPlatformDashboard } from "@features/platform-dashboard/services/fetch-platform-dashboard.service";
import type { PlatformDashboard } from "@features/platform-dashboard/types/platform-dashboard.types";

export async function PlatformDashboardContent(): Promise<React.ReactElement> {
  const dashboard: PlatformDashboard = await fetchPlatformDashboard();

  return <PlatformDashboardView dashboard={dashboard} />;
}
