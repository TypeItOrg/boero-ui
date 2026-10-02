export type TrainingPathSaveProgress = {
  trainingPathId: string;
  requirementRevisions?: Record<string, number>;
  requirementIds: Record<string, string>;
};
