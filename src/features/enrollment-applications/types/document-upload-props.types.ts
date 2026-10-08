import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import type { DocumentRequirement } from "@features/enrollment-applications/types/document-requirement.types";

export type DocumentUploadProps = {
  applicationId: string;
  scope: AcademicScope;
  requirement: DocumentRequirement;
  onSaved: () => Promise<void>;
  autoSave: boolean;
  disabled: boolean;
  onBlockedChange?: (id: string, blocked: boolean) => void;
  onWithdraw?: () => void;
  onCancel?: () => void;
};
