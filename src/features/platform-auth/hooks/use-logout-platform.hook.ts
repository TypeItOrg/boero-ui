"use client";

import { useMutation } from "@tanstack/react-query";

import { logoutPlatform } from "@features/platform-auth/actions/platform-logout.action";

export function useLogoutPlatform() {
  return useMutation({
    mutationFn: () => logoutPlatform(),
  });
}
