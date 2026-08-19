"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { parseHttpResponse } from "@common/utils/http-response-error.util";
import type { PlatformAccount } from "@features/platform-auth/types/platform-account.types";
import { platformAccountKeys } from "@features/platform-auth/utils/platform-account-keys.util";

type UsePlatformAccountOptions = Pick<UseQueryOptions<PlatformAccount | null>, "initialData" | "enabled">;

const PlatformAccountScopeContext = createContext<string | null>(null);

type PlatformAccountScopeProps = {
  accountId: string | null;
  children: ReactNode;
};

export function PlatformAccountScope({ accountId, children }: PlatformAccountScopeProps): ReactNode {
  return <PlatformAccountScopeContext.Provider value={accountId}>{children}</PlatformAccountScopeContext.Provider>;
}

export function usePlatformAccount(options: UsePlatformAccountOptions = {}) {
  const accountId = useContext(PlatformAccountScopeContext);

  const query = useQuery<PlatformAccount | null>({
    queryKey: platformAccountKeys.byAccount(accountId),
    queryFn: fetchPlatformAccount,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    ...options,
  });

  return {
    account: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

async function fetchPlatformAccount(): Promise<PlatformAccount | null> {
  const response = await fetch("/api/admin/account", { cache: "no-store" });
  return parseHttpResponse(response, "No se pudo actualizar la sesión de plataforma.");
}
