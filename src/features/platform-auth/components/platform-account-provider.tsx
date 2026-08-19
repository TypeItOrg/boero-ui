"use client";

import type { ReactNode } from "react";

import type { PlatformAccount } from "@features/platform-auth/types/platform-account.types";
import { PlatformAccountScope, usePlatformAccount } from "@features/platform-auth/hooks/use-platform-account.hook";

type PlatformAccountProviderProps = {
  initialAccount: PlatformAccount | null;
  children: ReactNode;
};

export function PlatformAccountProvider({ initialAccount, children }: PlatformAccountProviderProps): ReactNode {
  return (
    <PlatformAccountScope accountId={initialAccount?.platformAccountId ?? null}>
      <PlatformAccountInitialData initialAccount={initialAccount}>{children}</PlatformAccountInitialData>
    </PlatformAccountScope>
  );
}

function PlatformAccountInitialData({ initialAccount, children }: PlatformAccountProviderProps): ReactNode {
  usePlatformAccount({ initialData: initialAccount });

  return children;
}
