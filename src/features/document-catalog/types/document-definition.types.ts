export type DocumentDefinition = {
  id: string;
  institutionId: string;
  name: string;
  instructions: string;
  allowedFormats: string[];
  active: boolean;
  revision: number;
  canChangeInstitution?: boolean;
  affectedTrainingPaths?: number | null;
  affectedDrafts?: number | null;
};
