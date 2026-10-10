"use client";

import type { ReactElement } from "react";

import { approveEnrollmentApplicationAction } from "@features/enrollment-applications/actions/approve-enrollment-application.action";
import { EnrollmentApplicationApprovalDialog } from "@features/enrollment-applications/components/enrollment-application-approval-dialog";
import type { EnrollmentApplicationApprovalDialogProps } from "@features/enrollment-applications/types/enrollment-application-approval-dialog-props.types";

type Props = Omit<EnrollmentApplicationApprovalDialogProps, "approve">;

export function EnrollmentApplicationApproveDialog({ application, ...props }: Props): ReactElement {
  return (
    <EnrollmentApplicationApprovalDialog
      {...props}
      application={application}
      approve={() =>
        approveEnrollmentApplicationAction(application.institutionId, application.applicationId, application.canApproveProvisionally === true)
      }
    />
  );
}
