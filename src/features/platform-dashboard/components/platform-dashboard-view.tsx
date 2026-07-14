import { Fragment } from "react";
import Link from "next/link";
import {
  Building2Icon,
  BuildingIcon,
  CalendarPlusIcon,
  KeyRoundIcon,
  MapPinIcon,
  type LucideIcon,
  UsersIcon,
} from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { Separator } from "@common/components/ui/separator";
import { cn } from "@common/utils/cn.util";
import { InstitutionRegistrationChart } from "@features/platform-dashboard/components/institution-registration-chart";
import { InstitutionStatusChart } from "@features/platform-dashboard/components/institution-status-chart";
import type {
  PlatformDashboard,
  PlatformDashboardSummary,
  RecentInstitution,
} from "@features/platform-dashboard/types/platform-dashboard.types";
import { formatDashboardDate } from "@features/platform-dashboard/utils/dashboard-date.util";

const numberFormatter = new Intl.NumberFormat("es-AR");

type PlatformDashboardViewProps = {
  dashboard: PlatformDashboard;
};

export function PlatformDashboardView({ dashboard }: PlatformDashboardViewProps): React.ReactElement {
  const hasRegistrations = dashboard.institutionRegistrations.some((registration) => registration.count > 0);

  return (
    <div className="flex flex-col gap-5">
      <DashboardSummary summary={dashboard.summary} />

      <div className="grid min-w-0 gap-5 lg:grid-cols-3">
        <Card className="min-w-0 p-5 sm:p-6 lg:col-span-2">
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

function DashboardSummary({ summary }: { summary: PlatformDashboardSummary }): React.ReactElement {
  const cards: SummaryCardProps[] = [
    {
      label: "Instituciones",
      value: summary.institutions,
      description: "Registradas en la plataforma",
      icon: Building2Icon,
    },
    {
      label: "Instituciones activas",
      value: summary.activeInstitutions,
      description: "Habilitadas para operar en la plataforma",
      icon: BuildingIcon,
    },
    {
      label: "Personas",
      value: summary.people,
      description: "Registros institucionales vigentes",
      icon: UsersIcon,
    },
    {
      label: "Usuarios con acceso",
      value: summary.usersWithAccess,
      description: "Cuentas habilitadas para ingresar",
      icon: KeyRoundIcon,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <SummaryCard key={card.label} {...card} />
      ))}
    </div>
  );
}

type SummaryCardProps = {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
};

function SummaryCard({ label, value, description, icon: Icon }: SummaryCardProps): React.ReactElement {
  return (
    <Card className="p-5 sm:p-6">
      <CardHeader className="p-0">
        <CardTitle>{label}</CardTitle>
        <CardAction className="bg-muted flex size-9 items-center justify-center rounded-lg">
          <Icon className="text-muted-foreground size-4" aria-hidden="true" />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 p-0">
        <p className="text-4xl font-bold tracking-tight tabular-nums">{numberFormatter.format(value)}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </CardContent>
    </Card>
  );
}

function InstitutionStatusCard({ summary }: { summary: PlatformDashboardSummary }): React.ReactElement {
  return (
    <Card className="p-5 sm:p-6">
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

function StatusValue({ label, value, variant }: StatusValueProps): React.ReactElement {
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

function RecentInstitutionsCard({ institutions }: { institutions: RecentInstitution[] }): React.ReactElement {
  return (
    <Card className="p-5 sm:p-6">
      <CardHeader className="flex items-center justify-between gap-4 p-0">
        <div className="flex min-w-0 flex-col gap-1">
          <CardTitle>Instituciones recientes</CardTitle>
          <CardDescription className="truncate">
            Las últimas instituciones incorporadas a la plataforma.
          </CardDescription>
        </div>
        <div className="shrink-0 self-end">
          <Button asChild size="lg">
            <Link href="/platform/institutions">Ver todas</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {institutions.length === 0 ? (
          <DashboardEmptyState
            icon={Building2Icon}
            title="Todavía no hay instituciones"
            description="Las instituciones nuevas aparecerán en este espacio."
          />
        ) : (
          <div className="flex flex-col">
            {institutions.map((institution, index) => (
              <Fragment key={institution.id}>
                {index > 0 ? <Separator /> : null}
                <RecentInstitutionRow institution={institution} />
              </Fragment>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentInstitutionRow({ institution }: { institution: RecentInstitution }): React.ReactElement {
  return (
    <Link
      href={`/platform/institutions/${institution.id}`}
      className="hover:bg-muted/50 -mx-2 flex min-w-0 items-center gap-3 rounded-lg px-2 py-3 transition-colors"
    >
      <div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
        <BuildingIcon className="size-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate font-medium">{institution.name}</p>
          <Badge variant={institution.active ? "success" : "destructive"}>
            {institution.active ? "Activa" : "Inactiva"}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
          <MapPinIcon className="size-3.5" aria-hidden="true" />
          <span className="truncate">
            {institution.city}, {institution.province}
          </span>
        </p>
      </div>
      <time
        className="text-muted-foreground hidden shrink-0 text-xs tabular-nums sm:block"
        dateTime={institution.createdAt}
      >
        {formatDashboardDate(institution.createdAt)}
      </time>
    </Link>
  );
}

type DashboardEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

function DashboardEmptyState({ icon: Icon, title, description }: DashboardEmptyStateProps): React.ReactElement {
  return (
    <Empty className="min-h-56 border-0 p-4">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
