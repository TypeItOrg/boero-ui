import type { GuardianDependent } from "@features/guardian-dependents/types/guardian-dependent.types";

export function resolveGuardianWorkspaceDependent(
  dependents: readonly GuardianDependent[],
  workspaceId: string | undefined,
): GuardianDependent | undefined {
  if (!workspaceId) {
    return undefined;
  }

  return dependents.find((dependent) => dependent.dependentPersonId === workspaceId);
}
