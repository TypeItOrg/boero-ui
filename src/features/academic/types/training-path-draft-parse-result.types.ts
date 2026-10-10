import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import type { TrainingPathDocumentDraft } from "@features/academic/types/training-path-document-draft.types";

export type TrainingPathDraftParseResult = { success: true; data: TrainingPathDocumentDraft[] } | { success: false; state: AcademicActionState };
