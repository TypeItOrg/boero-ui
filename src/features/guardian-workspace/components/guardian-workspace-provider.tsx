"use client";

import { createContext, useContext, useState, useTransition, type PropsWithChildren, type ReactElement } from "react";

import type { GuardianDependent } from "@features/guardian-dependents/types/guardian-dependent.types";
import { setGuardianWorkspaceAction } from "@features/guardian-workspace/actions/set-guardian-workspace.action";
import type { GuardianWorkspaceContextValue } from "@features/guardian-workspace/types/guardian-workspace-context.types";
import { resolveGuardianWorkspaceDependent } from "@features/guardian-workspace/utils/resolve-guardian-workspace-dependent.util";

const GuardianWorkspaceContext = createContext<GuardianWorkspaceContextValue | null>(null);

type GuardianWorkspaceProviderProps = PropsWithChildren<{
  dependents: readonly GuardianDependent[];
  initialActiveDependentId?: string;
}>;

export function GuardianWorkspaceProvider({ children, dependents, initialActiveDependentId }: GuardianWorkspaceProviderProps): ReactElement {
  const [error, setError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const activeDependent = resolveGuardianWorkspaceDependent(dependents, initialActiveDependentId) ?? null;

  function selectDependent(dependentPersonId: string): void {
    if (
      !dependents.some((dependent) => dependent.dependentPersonId === dependentPersonId) ||
      dependentPersonId === activeDependent?.dependentPersonId
    ) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await setGuardianWorkspaceAction(dependentPersonId);

      if ("error" in result) {
        setError(result.error);

        return;
      }
    });
  }

  return <GuardianWorkspaceContext value={{ dependents, activeDependent, isPending, error, selectDependent }}>{children}</GuardianWorkspaceContext>;
}

export function useGuardianWorkspace(): GuardianWorkspaceContextValue {
  const context = useContext(GuardianWorkspaceContext);

  if (!context) {
    throw new Error("useGuardianWorkspace debe utilizarse dentro de GuardianWorkspaceProvider.");
  }

  return context;
}
