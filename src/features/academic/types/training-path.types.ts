export type TrainingPath = {
  id: string;
  institutionId: string;
  institutionName?: string;
  name: string;
  description: string | null;
  active: boolean;
  deletedAt?: string | null;
};
