"use client";

import { createContext, useContext } from "react";

import { COMMON_ERROR_MESSAGES } from "@common/constants/error-messages.constants";
import { type SidebarContextProps } from "@common/types/sidebar-context.types";

export const SidebarContext = createContext<SidebarContextProps | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error(COMMON_ERROR_MESSAGES.SIDEBAR_CONTEXT);
  }

  return context;
}
