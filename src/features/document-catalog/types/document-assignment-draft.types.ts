import type { DocumentAssignment } from "@features/document-catalog/types/document-assignment.types";

export type DocumentAssignmentDraft = {
  identity: string;
  generation: number;
  changes: Record<string, DocumentAssignment>;
  removed: Record<string, DocumentAssignment>;
  error: string;
};
