"use client";

import React from "react";
import { redirect, usePathname, useSearchParams } from "next/navigation";

import type { PlatformAccount } from "@features/platform-auth/types/platform-account.types";
import { usePlatformAccount } from "@features/platform-auth/hooks/use-platform-account.hook";

import { getRedirectPath } from "@features/platform-auth/utils/platform-auth-paths.util";

type PlatformAccountProviderProps = {
  initialAccount: PlatformAccount | null;
  children: React.ReactNode;
};

export function PlatformAccountProvider({ initialAccount, children }: PlatformAccountProviderProps): React.ReactNode {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { account } = usePlatformAccount({ initialData: initialAccount });

  if (account === null) {
    const search = searchParams ? searchParams.toString() : "";
    const currentPath = pathname + (search ? `?${search}` : "");
    redirect(getRedirectPath("/auth/platform/login", currentPath));
  }

  return <React.Fragment>{children}</React.Fragment>;
}
