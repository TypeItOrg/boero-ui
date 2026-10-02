export type DocumentDefinition = {
  id: string;
  institutionId: string;
  name: string;
  instructions: string;
  allowedFormats: string[];
  active: boolean;
  revision: number;
  affectedTrainingPaths?: number | null;
  affectedDrafts?: number | null;
};
