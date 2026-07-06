"use client";

import React from "react";

import type { PlatformAccount } from "@features/platform-auth/types/platform-account.types";
import { usePlatformAccount } from "@features/platform-auth/hooks/use-platform-account.hook";

type PlatformAccountProviderProps = {
  initialAccount: PlatformAccount | null;
  children: React.ReactNode;
};

export function PlatformAccountProvider({ initialAccount, children }: PlatformAccountProviderProps): React.ReactNode {
  usePlatformAccount({ initialData: initialAccount });

  return <React.Fragment>{children}</React.Fragment>;
}
