import { Building2Icon, BuildingIcon, KeyRoundIcon, UsersIcon, type LucideIcon } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@common/components/ui/card";
import type { PlatformDashboardSummary as PlatformDashboardSummaryData } from "@features/platform-dashboard/types/platform-dashboard-summary.types";

const numberFormatter = new Intl.NumberFormat("es-AR");

type SummaryCardProps = {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
};

function SummaryCard({ label, value, description, icon: Icon }: SummaryCardProps): React.ReactElement {
  return (
    <Card className="bg-background p-5 sm:p-6">
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

export function PlatformDashboardSummary({ summary }: { summary: PlatformDashboardSummaryData }): React.ReactElement {
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
