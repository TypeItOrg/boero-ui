import type { ReactElement } from "react";

import { BuildingIcon, CalendarPlusIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import { cn } from "@common/utils/cn.util";

import { DashboardEmptyState } from "@features/platform-dashboard/components/dashboard-empty-state";
import { InstitutionRegistrationChart } from "@features/platform-dashboard/components/institution-registration-chart";
import { InstitutionStatusChart } from "@features/platform-dashboard/components/institution-status-chart";
import { PlatformDashboardSummary } from "@features/platform-dashboard/components/platform-dashboard-summary";
import { RecentInstitutionsCard } from "@features/platform-dashboard/components/recent-institutions-card";
import type { PlatformDashboardSummary as PlatformDashboardSummaryData } from "@features/platform-dashboard/types/platform-dashboard-summary.types";
import type { PlatformDashboard } from "@features/platform-dashboard/types/platform-dashboard.types";

const numberFormatter = new Intl.NumberFormat("es-AR");

type PlatformDashboardViewProps = {
  dashboard: PlatformDashboard;
};

export function PlatformDashboardView({ dashboard }: PlatformDashboardViewProps): ReactElement {
  const hasRegistrations = dashboard.institutionRegistrations.some((registration) => registration.count > 0);

  return (
    <div className="flex flex-col gap-4">
      <PlatformDashboardSummary summary={dashboard.summary} />

      <div className="grid min-w-0 gap-4 lg:grid-cols-3">
        <Card className="bg-background min-w-0 p-5 sm:p-6 lg:col-span-2">
          <CardHeader className="p-0">
            <CardTitle>Altas de instituciones</CardTitle>
            <CardDescription>Instituciones creadas durante los últimos 12 meses.</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0 p-0">
            {hasRegistrations ? (
              <InstitutionRegistrationChart registrations={dashboard.institutionRegistrations} />
            ) : (
              <DashboardEmptyState
                icon={CalendarPlusIcon}
                title="Sin altas recientes"
                description="No se registraron instituciones durante los últimos 12 meses."
              />
            )}
          </CardContent>
        </Card>

        <InstitutionStatusCard summary={dashboard.summary} />
      </div>

      <RecentInstitutionsCard institutions={dashboard.recentInstitutions} />
    </div>
  );
}

function InstitutionStatusCard({ summary }: { summary: PlatformDashboardSummaryData }): ReactElement {
  return (
    <Card className="bg-background p-5 sm:p-6">
      <CardHeader className="p-0">
        <CardTitle>Estado institucional</CardTitle>
        <CardDescription>Disponibilidad actual de las instituciones.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center p-0">
        {summary.institutions === 0 ? (
          <DashboardEmptyState
            icon={BuildingIcon}
            title="Sin instituciones"
            description="El estado se mostrará cuando exista al menos una institución."
          />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <InstitutionStatusChart active={summary.activeInstitutions} inactive={summary.inactiveInstitutions} />
            <div className="grid w-full grid-cols-2 gap-3">
              <StatusValue label="Activas" value={summary.activeInstitutions} variant="active" />
              <StatusValue label="Inactivas" value={summary.inactiveInstitutions} variant="inactive" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type StatusValueProps = {
  label: string;
  value: number;
  variant: "active" | "inactive";
};

function StatusValue({ label, value, variant }: StatusValueProps): ReactElement {
  return (
    <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
      <span className={cn("size-2.5 rounded-full", variant === "active" ? "bg-primary" : "bg-muted-foreground")} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-muted-foreground text-xs">{label}</span>
        <span className="font-medium tabular-nums">{numberFormatter.format(value)}</span>
      </div>
    </div>
  );
}
