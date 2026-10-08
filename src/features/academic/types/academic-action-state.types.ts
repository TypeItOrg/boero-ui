import type { TrainingPathSaveProgress } from "@features/academic/types/training-path-save-progress.types";

export type AcademicActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  trainingPathProgress?: TrainingPathSaveProgress;
  trainingPathSaveUncertain?: boolean;
};
