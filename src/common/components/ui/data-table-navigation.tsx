"use client";

import { createContext, useCallback, useContext, useTransition, type PropsWithChildren, type ReactElement } from "react";

import { COMMON_ERROR_MESSAGES } from "@common/constants/error-messages.constants";
import { useSearchParamNavigation } from "@common/hooks/use-search-param-navigation";

type NavigateOptions = {
  scroll?: boolean;
  replace?: boolean;
};

type DataTableNavigationContextValue = {
  isPending: boolean;
  navigate: (updates: Record<string, string | undefined>, options?: NavigateOptions) => void;
};

const DataTableNavigationContext = createContext<DataTableNavigationContextValue | null>(null);

export function DataTableNavigationProvider({ children }: PropsWithChildren): ReactElement {
  const { navigate: navigateToSearchParams } = useSearchParamNavigation();

  const [isPending, startTransition] = useTransition();

  const navigate = useCallback(
    (updates: Record<string, string | undefined>, options?: NavigateOptions): void => {
      startTransition(() => navigateToSearchParams(updates, options));
    },
    [navigateToSearchParams],
  );

  return <DataTableNavigationContext value={{ isPending, navigate }}>{children}</DataTableNavigationContext>;
}

export function useDataTableNavigation(): DataTableNavigationContextValue {
  const context = useContext(DataTableNavigationContext);

  if (!context) {
    throw new Error(COMMON_ERROR_MESSAGES.DATA_TABLE_NAVIGATION_CONTEXT);
  }

  return context;
}
