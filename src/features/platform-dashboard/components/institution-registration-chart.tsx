"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@common/components/ui/chart";
import type { MonthlyInstitutionRegistration } from "@features/platform-dashboard/types/platform-dashboard.types";
import { formatDashboardMonth } from "@features/platform-dashboard/utils/dashboard-month.util";

const chartConfig = {
  count: {
    label: "Instituciones",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

type InstitutionRegistrationChartProps = {
  registrations: MonthlyInstitutionRegistration[];
};

export function InstitutionRegistrationChart({ registrations }: InstitutionRegistrationChartProps): React.ReactElement {
  const chartData = registrations.map((registration) => ({
    ...registration,
    label: formatDashboardMonth(registration, "short"),
    fullLabel: formatDashboardMonth(registration, "long"),
  }));

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full min-w-0">
      <BarChart accessibilityLayer data={chartData} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} tickMargin={10} axisLine={false} interval="preserveStartEnd" />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent labelFormatter={(_value, payload) => payload[0]?.payload.fullLabel} indicator="line" />
          }
        />
        <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 2, 2]} />
      </BarChart>
    </ChartContainer>
  );
}
