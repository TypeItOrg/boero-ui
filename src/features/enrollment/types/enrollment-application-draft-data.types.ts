export type EnrollmentApplicationDraftData = Record<string, unknown> & {
  careerSelection?: {
    trainingPathId?: string | null;
  };
};
