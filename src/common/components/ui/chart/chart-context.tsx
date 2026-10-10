"use client";

import { createContext, useContext } from "react";

import { COMMON_ERROR_MESSAGES } from "@common/constants/error-messages.constants";
import { type ChartConfig } from "@common/types/chart-config.types";

export const ChartContext = createContext<ChartContextProps | null>(null);

export type ChartContextProps = {
  config: ChartConfig;
};

export function useChart() {
  const context = useContext(ChartContext);

  if (!context) {
    throw new Error(COMMON_ERROR_MESSAGES.CHART_CONTEXT);
  }

  return context;
}
