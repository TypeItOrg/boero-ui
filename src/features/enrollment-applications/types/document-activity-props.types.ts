import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import type { DocumentRequirement } from "@features/enrollment-applications/types/document-requirement.types";

export type DocumentActivityProps = {
  applicationId: string;
  scope: AcademicScope;
  requirement: DocumentRequirement;
  initialTab: "deliveries" | "changes";
  showRequirementChanges: boolean;
  onClose: () => void;
  onReturnFocus: () => void;
};
