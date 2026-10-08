import type { DocumentRequirement } from "@features/enrollment-applications/types/document-requirement.types";

export type TrainingPathDocumentDraft = Pick<DocumentRequirement, "name" | "instructions" | "level" | "allowedFormats" | "displayOrder"> & {
  documentId?: string;
  documentActive?: boolean;
  revision?: number;
  specificInstructions?: string | null;
  clientId: string;
  id: string | null;
  active: boolean;
  dirty: boolean;
};
