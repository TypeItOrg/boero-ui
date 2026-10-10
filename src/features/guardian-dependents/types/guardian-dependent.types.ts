import type { GuardianLinkStatus } from "@features/guardian-dependents/types/guardian-link-status.types";
import type { GuardianRelationship } from "@features/guardian-dependents/types/guardian-relationship.types";

export type GuardianDependent = {
  personGuardianId: string;
  dependentPersonId: string;
  status: GuardianLinkStatus;
  documentNumber: string;
  // Hidden by the API until the institution approves the link.
  firstName: string | null;
  lastName: string | null;
  birthDate: string | null;
  relationship: GuardianRelationship;
  isPrimaryContact: boolean;
  activeApplicationsCount: number;
  roles: readonly string[];
  createdAt: string;
};
