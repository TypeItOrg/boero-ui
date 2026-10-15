import type { GuardianDependent } from "@features/guardian-dependents/types/guardian-dependent.types";

export function resolveGuardianWorkspaceDependent(
  dependents: readonly GuardianDependent[],
  workspaceId: string | undefined,
): GuardianDependent | undefined {
  const workspaceDependent = workspaceId ? dependents.find((dependent) => dependent.dependentPersonId === workspaceId) : undefined;

  return workspaceDependent ?? (dependents.length === 1 ? dependents[0] : undefined);
}
