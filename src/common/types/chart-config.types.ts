import type { ComponentType, ReactNode } from "react";

import { THEMES } from "@common/components/ui/chart";

export type ChartConfig = Record<
  string,
  {
    label?: ReactNode;
    icon?: ComponentType;
  } & ({ color?: string; theme?: never } | { color?: never; theme: Record<keyof typeof THEMES, string> })
>;
