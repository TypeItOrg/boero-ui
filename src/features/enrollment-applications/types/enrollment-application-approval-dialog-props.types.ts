import type { EnrollmentApplicationActionState } from "@features/enrollment-applications/types/enrollment-application-action-state.types";
import type { EnrollmentApplicationReviewSummary } from "@features/enrollment-applications/types/enrollment-application-review-summary.types";

export type EnrollmentApplicationApprovalDialogProps = {
  application: EnrollmentApplicationReviewSummary;
  approve: () => Promise<EnrollmentApplicationActionState>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApproved: () => void;
};
