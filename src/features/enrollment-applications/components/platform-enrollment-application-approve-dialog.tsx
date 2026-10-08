"use client";

import type { ReactElement } from "react";

import { approvePlatformEnrollmentApplicationAction } from "@features/enrollment-applications/actions/approve-platform-enrollment-application.action";
import { EnrollmentApplicationApprovalDialog } from "@features/enrollment-applications/components/enrollment-application-approval-dialog";
import type { EnrollmentApplicationApprovalDialogProps } from "@features/enrollment-applications/types/enrollment-application-approval-dialog-props.types";

type Props = Omit<EnrollmentApplicationApprovalDialogProps, "approve">;

export function PlatformEnrollmentApplicationApproveDialog({ application, ...props }: Props): ReactElement {
  return (
    <EnrollmentApplicationApprovalDialog
      {...props}
      application={application}
      approve={() =>
        approvePlatformEnrollmentApplicationAction(application.institutionId, application.applicationId, application.canApproveProvisionally === true)
      }
    />
  );
}
