export type DocumentAssignment = {
  id?: string;
  trainingPathId: string;
  trainingPathName?: string;
  revision?: number;
  level: "AT_SUBMISSION" | "BEFORE_CONFIRMATION" | "OPTIONAL";
  displayOrder: number;
  active: boolean;
  specificInstructions: string | null;
};
