"use client";

import type { ReactElement } from "react";

import { rejectEnrollmentApplicationAction } from "@features/enrollment-applications/actions/reject-enrollment-application.action";
import { EnrollmentRejectionDialog } from "@features/enrollment-applications/components/enrollment-rejection-dialog";
import type { EnrollmentApplicationReviewSummary } from "@features/enrollment-applications/types/enrollment-application-review-summary.types";

type EnrollmentApplicationRejectDialogProps = {
  application: EnrollmentApplicationReviewSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRejected: () => void;
};

export function EnrollmentApplicationRejectDialog({ application, ...props }: EnrollmentApplicationRejectDialogProps): ReactElement {
  return (
    <EnrollmentRejectionDialog
      {...props}
      applicantName={application.applicantName}
      action={rejectEnrollmentApplicationAction.bind(null, application.institutionId, application.applicationId)}
    />
  );
}
