import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";

export type DocumentDefinitionSaveResult = {
  document: DocumentDefinition;
  affectedTrainingPaths: number;
  affectedDrafts: number;
};
