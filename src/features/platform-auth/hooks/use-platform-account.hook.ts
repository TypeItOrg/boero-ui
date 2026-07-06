"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { getPlatformAccountAction } from "@features/platform-auth/actions/get-platform-account.action";
import { platformAccountKeys } from "@features/platform-auth/utils/platform-account-keys.util";
import type { PlatformAccount } from "@features/platform-auth/types/platform-account.types";

type UsePlatformAccountOptions = Pick<UseQueryOptions<PlatformAccount | null>, "initialData" | "enabled">;

export function usePlatformAccount(options: UsePlatformAccountOptions = {}) {
  const query = useQuery<PlatformAccount | null>({
    queryKey: platformAccountKeys.ALL,
    queryFn: getPlatformAccountAction,
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
