"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactElement, type ReactNode } from "react";

import { SIDEBAR_NAVIGATION_GROUPS_COOKIE_MAX_AGE, SIDEBAR_NAVIGATION_GROUPS_COOKIE_NAMES } from "@common/constants/sidebar-navigation.constants";
import type { SidebarNavigationGroupStates } from "@common/types/sidebar-navigation-group-states.types";

type SidebarNavigationState = {
  groupStates: SidebarNavigationGroupStates;
  setGroupOpen: (id: string, open: boolean) => void;
};

type SidebarNavigationStateProviderProps = {
  children: ReactNode;
  scope: keyof typeof SIDEBAR_NAVIGATION_GROUPS_COOKIE_NAMES;
  initialStates: SidebarNavigationGroupStates;
};

const SidebarNavigationStateContext = createContext<SidebarNavigationState | null>(null);

export function SidebarNavigationStateProvider({ children, scope, initialStates }: SidebarNavigationStateProviderProps): ReactElement {
  const [groupStates, setGroupStates] = useState(initialStates);

  const cookieName = SIDEBAR_NAVIGATION_GROUPS_COOKIE_NAMES[scope];

  const setGroupOpen = useCallback((id: string, open: boolean) => {
    setGroupStates((states) => {
      if (states[id] === open) {
        return states;
      }

      return { ...states, [id]: open };
    });
  }, []);

  useEffect(() => {
    if (groupStates === initialStates) {
      return;
    }

    const value = encodeURIComponent(JSON.stringify(groupStates));

    const secure = window.location.protocol === "https:" ? "; secure" : "";

    try {
      document.cookie = `${cookieName}=${value}; path=/; max-age=${SIDEBAR_NAVIGATION_GROUPS_COOKIE_MAX_AGE}; samesite=lax${secure}`;
    } catch {
      // Keep navigation usable when the browser blocks preference cookies.
    }
  }, [cookieName, groupStates, initialStates]);

  return <SidebarNavigationStateContext.Provider value={{ groupStates, setGroupOpen }}>{children}</SidebarNavigationStateContext.Provider>;
}

export function useSidebarNavigationState(): SidebarNavigationState {
  const context = useContext(SidebarNavigationStateContext);

  if (!context) {
    throw new Error("useSidebarNavigationState must be used within SidebarNavigationStateProvider.");
  }

  return context;
}
