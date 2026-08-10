"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { platformAccountKeys } from "@features/platform-auth/utils/platform-account-keys.util";
import type { PlatformAccount } from "@features/platform-auth/types/platform-account.types";

type UsePlatformAccountOptions = Pick<UseQueryOptions<PlatformAccount | null>, "initialData" | "enabled">;

export function usePlatformAccount(options: UsePlatformAccountOptions = {}) {
  const query = useQuery<PlatformAccount | null>({
    queryKey: platformAccountKeys.ALL,
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
