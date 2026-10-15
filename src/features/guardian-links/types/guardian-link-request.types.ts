import type { GuardianLinkStatus } from "@features/guardian-dependents/types/guardian-link-status.types";
import type { GuardianRelationship } from "@features/guardian-dependents/types/guardian-relationship.types";
import type { GuardianLinkAttachment } from "@features/guardian-links/types/guardian-link-attachment.types";
import type { GuardianLinkPerson } from "@features/guardian-links/types/guardian-link-person.types";

export type GuardianLinkRequest = {
  personGuardianId: string;
  status: GuardianLinkStatus;
  relationship: GuardianRelationship;
  institution?: {
    institutionId: string;
    name: string;
  };
  tutor: GuardianLinkPerson;
  dependent: GuardianLinkPerson;
  createdAt: string;
  resolvedAt: string | null;
  attachments: GuardianLinkAttachment[];
};
