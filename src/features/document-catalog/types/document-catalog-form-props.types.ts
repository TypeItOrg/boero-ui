import type { ReactNode } from "react";

import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import type { DocumentDefinitionDefaults } from "@features/document-catalog/types/document-definition-defaults.types";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";

export type DocumentCatalogFormProps = {
  scope: AcademicScope;
  institutionId?: string;
  institutionField?: ReactNode;
  targetInstitutionId?: string;
  copySourceInstitutionId?: string;
  defaults?: DocumentDefinitionDefaults;
  initial?: DocumentDefinition;
  onSaved?: (document: DocumentDefinition) => void;
  onCancel?: () => void;
  onPendingChange?: (pending: boolean) => void;
  returnTo?: string;
  allowAssignments?: boolean;
  layout?: "page" | "dialog";
};
