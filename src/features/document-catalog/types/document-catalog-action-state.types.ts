import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";
export type DocumentCatalogActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
  uncertain?: boolean;
  document?: DocumentDefinition;
  affectedTrainingPaths?: number;
  affectedDrafts?: number;
};
