"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { getInstitutionalUserAction } from "@features/institutional-auth/actions/get-institutional-user.action";
import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";
import { institutionalUserKeys } from "@features/institutional-auth/utils/institutional-user-keys.util";

type UseInstitutionalUserOptions = Pick<UseQueryOptions<InstitutionalUser | null>, "initialData" | "enabled">;

export function useInstitutionalUser(options: UseInstitutionalUserOptions = {}) {
  const query = useQuery<InstitutionalUser | null>({
    queryKey: institutionalUserKeys.ALL,
    queryFn: getInstitutionalUserAction,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    ...options,
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
