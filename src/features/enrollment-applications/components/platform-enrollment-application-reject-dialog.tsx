"use client";

import type { ReactElement } from "react";

import { rejectPlatformEnrollmentApplicationAction } from "@features/enrollment-applications/actions/reject-platform-enrollment-application.action";
import { EnrollmentRejectionDialog } from "@features/enrollment-applications/components/enrollment-rejection-dialog";
import type { PlatformEnrollmentApplicationSummary } from "@features/enrollment-applications/types/platform-enrollment-application-summary.types";

type PlatformEnrollmentApplicationRejectDialogProps = {
  application: PlatformEnrollmentApplicationSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRejected: () => void;
};

export function PlatformEnrollmentApplicationRejectDialog({ application, ...props }: PlatformEnrollmentApplicationRejectDialogProps): ReactElement {
  return (
    <EnrollmentRejectionDialog
      {...props}
      applicantName={application.applicantName}
      action={rejectPlatformEnrollmentApplicationAction.bind(null, application.institutionId, application.applicationId)}
    />
  );
}
