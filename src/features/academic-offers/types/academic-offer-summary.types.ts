export type AcademicOfferSummary = {
  studyPlanId: string;
  studyPlanName: string;
  studyPlanVersion: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  trainingPathId: string;
  trainingPathName: string;
  trainingPathDescription: string | null;
};
