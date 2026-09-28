import type { GuardianDependent } from "@features/guardian-dependents/types/guardian-dependent.types";

export type GuardianWorkspaceContextValue = {
  dependents: readonly GuardianDependent[];
  activeDependent: GuardianDependent | null;
  isPending: boolean;
  error: string | null;
  selectDependent: (dependentPersonId: string) => void;
};
