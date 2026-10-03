import type { GuardianLinkStatus } from "@features/guardian-dependents/types/guardian-link-status.types";
import type { GuardianRelationship } from "@features/guardian-dependents/types/guardian-relationship.types";

export type GuardianLinkPerson = {
  personId: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
};

export type GuardianLinkAttachment = {
  id: string;
  originalFileName: string;
  contentType: string;
  size: number;
  createdAt: string;
};

export type GuardianLinkRequest = {
  personGuardianId: string;
  status: GuardianLinkStatus;
  relationship: GuardianRelationship;
  tutor: GuardianLinkPerson;
  dependent: GuardianLinkPerson;
  createdAt: string;
  resolvedAt: string | null;
  attachments: GuardianLinkAttachment[];
};

export type GuardianLinkDecision = "approve" | "reject";
