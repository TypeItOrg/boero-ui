import type { GuardianRelationship } from "@features/guardian-dependents/types/guardian-relationship.types";

export type GuardianDependent = {
  personGuardianId: string;
  dependentPersonId: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  relationship: GuardianRelationship;
  isPrimaryContact: boolean;
  activeApplicationsCount: number;
  createdAt: string;
};
