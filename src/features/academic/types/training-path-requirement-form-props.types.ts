import type { TrainingPathDocumentDraft } from "@features/academic/types/training-path-document-draft.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

export type TrainingPathRequirementFormProps = {
  initial?: TrainingPathDocumentDraft;
  scope: AcademicScope;
  institutionId: string;
  pathId?: string;
  canManageCatalog: boolean;
  creating: boolean;
  onCreatingChange: (creating: boolean) => void;
  onSave: (draft: Omit<TrainingPathDocumentDraft, "clientId" | "id" | "dirty">) => void;
  onCancel: () => void;
  existing: TrainingPathDocumentDraft[];
  onPendingChange: (pending: boolean) => void;
};
