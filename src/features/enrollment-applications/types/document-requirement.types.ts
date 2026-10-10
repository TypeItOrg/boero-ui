import type { DocumentDelivery } from "@features/enrollment-applications/types/document-delivery.types";

export interface DocumentRequirement {
  id: string;
  origin?: "ORIGINAL" | "ADDITIONAL";
  requestId?: string | null;
  sourceRequirementId?: string | null;
  appliedDefinitionRevision?: number | null;
  appliedAssignmentRevision?: number | null;
  documentId?: string;
  revision?: number;
  definitionRevision?: number;
  specificInstructions?: string | null;
  documentActive?: boolean;
  needsReplacement?: boolean;
  changes?: Array<{ action: string; occurredAt: string; name: string }>;
  name: string;
  instructions: string;
  level: "AT_SUBMISSION" | "BEFORE_CONFIRMATION" | "OPTIONAL";
  allowedFormats: string[];
  displayOrder: number;
  active?: boolean;
  status?: "MISSING" | "PENDING_REVIEW" | "OBSERVED" | "ACCEPTED";
  currentAttachment?: DocumentDelivery | null;
  canUpload?: boolean;
  canReplace?: boolean;
  canWithdraw?: boolean;
  canReview?: boolean;
}
