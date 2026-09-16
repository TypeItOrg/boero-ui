"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BadgeCheckIcon, BanIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { EnrollmentApplicationApproveDialog } from "@features/enrollment-applications/components/enrollment-application-approve-dialog";
import { EnrollmentApplicationRejectDialog } from "@features/enrollment-applications/components/enrollment-application-reject-dialog";
import {
  ENROLLMENT_APPLICATION_STATUS,
  type EnrollmentApplicationStatus,
} from "@features/enrollment-applications/types/enrollment-application-status.types";
import type { EnrollmentApplicationReviewSummary } from "@features/enrollment-applications/types/enrollment-application-review-summary.types";

type EnrollmentApplicationResolvePanelProps = {
  application: EnrollmentApplicationReviewSummary;
  status: EnrollmentApplicationStatus;
  canApprove: boolean;
  canReject: boolean;
};

export function EnrollmentApplicationResolvePanel({
  application,
  status,
  canApprove,
  canReject,
}: EnrollmentApplicationResolvePanelProps): React.ReactElement | null {
  const router = useRouter();
  const [showApproveDialog, setShowApproveDialog] = React.useState(false);
  const [showRejectDialog, setShowRejectDialog] = React.useState(false);

  function handleResolved(): void {
    setShowApproveDialog(false);
    setShowRejectDialog(false);
    router.refresh();
  }

  if (status !== ENROLLMENT_APPLICATION_STATUS.SUBMITTED || (!canApprove && !canReject)) {
    return null;
  }

  return (
    <>
      <div className="flex w-full flex-col gap-2 @2xl/page-shell:w-auto @2xl/page-shell:flex-row">
        {canApprove ? (
          <Button type="button" size="lg" className="w-full @2xl/page-shell:w-auto" onClick={() => setShowApproveDialog(true)}>
            <BadgeCheckIcon aria-hidden="true" />
            Aprobar inscripción
          </Button>
        ) : null}
        {canReject ? (
          <Button type="button" size="lg" variant="destructive" className="w-full @2xl/page-shell:w-auto" onClick={() => setShowRejectDialog(true)}>
            <BanIcon aria-hidden="true" />
            Rechazar inscripción
          </Button>
        ) : null}
      </div>

      {showApproveDialog ? (
        <EnrollmentApplicationApproveDialog application={application} open onOpenChange={setShowApproveDialog} onApproved={handleResolved} />
      ) : null}

      {showRejectDialog ? (
        <EnrollmentApplicationRejectDialog application={application} open onOpenChange={setShowRejectDialog} onRejected={handleResolved} />
      ) : null}
    </>
  );
}
