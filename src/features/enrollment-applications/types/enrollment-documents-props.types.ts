import type { ReactNode } from "react";

import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";

export type EnrollmentDocumentsProps = {
  application: EnrollmentApplicationResponse;
  scope?: AcademicScope;
  title?: string;
  footer?: ReactNode;
  showRequirementChanges?: boolean;
  showDeliveryHistory?: boolean;
  administrativeView?: boolean;
  autoSave?: boolean;
  disabled?: boolean;
  onUploadBlockedChange?: (id: string, blocked: boolean) => void;
};
