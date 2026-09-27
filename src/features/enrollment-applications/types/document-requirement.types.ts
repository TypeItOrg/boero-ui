import type { DocumentDelivery } from "@features/enrollment-applications/types/document-delivery.types";
export interface DocumentRequirement {
  id: string;
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
