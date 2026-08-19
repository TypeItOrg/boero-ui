"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logoutPlatform } from "@features/platform-auth/actions/platform-logout.action";
import { platformAccountKeys } from "@features/platform-auth/utils/platform-account-keys.util";

export function useLogoutPlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutPlatform(),
    onMutate: () => {
      queryClient.removeQueries({ queryKey: platformAccountKeys.ALL });
    },
  });
}
