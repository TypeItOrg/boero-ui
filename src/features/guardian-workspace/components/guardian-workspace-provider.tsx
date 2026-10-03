"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import type { GuardianDependent } from "@features/guardian-dependents/types/guardian-dependent.types";
import { setGuardianWorkspaceAction } from "@features/guardian-workspace/actions/set-guardian-workspace.action";
import type { GuardianWorkspaceContextValue } from "@features/guardian-workspace/types/guardian-workspace-context.types";

const GuardianWorkspaceContext = React.createContext<GuardianWorkspaceContextValue | null>(null);

type GuardianWorkspaceProviderProps = React.PropsWithChildren<{
  dependents: readonly GuardianDependent[];
  initialActiveDependentId?: string;
}>;

export function GuardianWorkspaceProvider({ children, dependents, initialActiveDependentId }: GuardianWorkspaceProviderProps): React.ReactElement {
  const router = useRouter();
  const [activeDependentId, setActiveDependentId] = React.useState<string | null>(() =>
    dependents.some((dependent) => dependent.dependentPersonId === initialActiveDependentId)
      ? (initialActiveDependentId ?? null)
      : dependents.length === 1
        ? dependents[0].dependentPersonId
        : null,
  );
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const effectiveActiveDependentId = dependents.some((dependent) => dependent.dependentPersonId === activeDependentId)
    ? activeDependentId
    : dependents.some((dependent) => dependent.dependentPersonId === initialActiveDependentId)
      ? (initialActiveDependentId ?? null)
      : dependents.length === 1
        ? dependents[0].dependentPersonId
        : null;
  const activeDependent = dependents.find((dependent) => dependent.dependentPersonId === effectiveActiveDependentId) ?? null;

  function selectDependent(dependentPersonId: string): void {
    if (!dependents.some((dependent) => dependent.dependentPersonId === dependentPersonId) || dependentPersonId === effectiveActiveDependentId) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await setGuardianWorkspaceAction(dependentPersonId);

      if ("error" in result) {
        setError(result.error);
        return;
      }

      setActiveDependentId(dependentPersonId);
      router.refresh();
    });
  }

  return <GuardianWorkspaceContext value={{ dependents, activeDependent, isPending, error, selectDependent }}>{children}</GuardianWorkspaceContext>;
}

export function useGuardianWorkspace(): GuardianWorkspaceContextValue {
  const context = React.useContext(GuardianWorkspaceContext);

  if (!context) {
    throw new Error("useGuardianWorkspace debe utilizarse dentro de GuardianWorkspaceProvider.");
  }

  return context;
}
