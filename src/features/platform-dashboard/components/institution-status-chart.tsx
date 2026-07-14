"use client";

import { Label, Pie, PieChart } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@common/components/ui/chart";

const chartConfig = {
  active: {
    label: "Activas",
    color: "var(--primary)",
  },
  inactive: {
    label: "Inactivas",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig;

type InstitutionStatusChartProps = {
  active: number;
  inactive: number;
};

export function InstitutionStatusChart({ active, inactive }: InstitutionStatusChartProps): React.ReactElement {
  const total = active + inactive;
  const activePercentage = Math.round((active / total) * 100);
  const chartData = [
    { status: "active", count: active, fill: "var(--color-active)" },
    { status: "inactive", count: inactive, fill: "var(--color-inactive)" },
  ];

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square size-52">
      <PieChart accessibilityLayer>
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="status" />} />
        <Pie data={chartData} dataKey="count" nameKey="status" innerRadius={62} outerRadius={84} strokeWidth={5}>
          <Label
            content={({ viewBox }) => {
              if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
                return null;
              }

              return (
                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                  <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-semibold">
                    {activePercentage}%
                  </tspan>
                  <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 24} className="fill-muted-foreground text-xs">
                    activas
                  </tspan>
                </text>
              );
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
