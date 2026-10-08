import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";

export type TrainingPathRecordSaveResult = { success: true; pathId: string } | { success: false; state: AcademicActionState };
