"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BadgeCheckIcon, BanIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { PlatformEnrollmentApplicationApproveDialog } from "@features/enrollment-applications/components/platform-enrollment-application-approve-dialog";
import { PlatformEnrollmentApplicationRejectDialog } from "@features/enrollment-applications/components/platform-enrollment-application-reject-dialog";
import {
  ENROLLMENT_APPLICATION_STATUS,
  type EnrollmentApplicationStatus,
} from "@features/enrollment-applications/types/enrollment-application-status.types";
import type { PlatformEnrollmentApplicationSummary } from "@features/enrollment-applications/types/platform-enrollment-application-summary.types";

type PlatformEnrollmentApplicationResolvePanelProps = {
  application: PlatformEnrollmentApplicationSummary;
  status: EnrollmentApplicationStatus;
};

export function PlatformEnrollmentApplicationResolvePanel({
  application,
  status,
}: PlatformEnrollmentApplicationResolvePanelProps): React.ReactElement | null {
  const router = useRouter();
  const [showApproveDialog, setShowApproveDialog] = React.useState(false);
  const [showRejectDialog, setShowRejectDialog] = React.useState(false);

  function handleResolved(): void {
    setShowApproveDialog(false);
    setShowRejectDialog(false);
    router.refresh();
  }

  if (status !== ENROLLMENT_APPLICATION_STATUS.SUBMITTED) {
    return null;
  }

  return (
    <>
      <div className="flex w-full flex-col gap-2 @2xl/page-shell:w-auto @2xl/page-shell:flex-row">
        <Button type="button" size="lg" className="w-full @2xl/page-shell:w-auto" onClick={() => setShowApproveDialog(true)}>
          <BadgeCheckIcon aria-hidden="true" />
          Aprobar inscripción
        </Button>
        <Button type="button" size="lg" variant="destructive" className="w-full @2xl/page-shell:w-auto" onClick={() => setShowRejectDialog(true)}>
          <BanIcon aria-hidden="true" />
          Rechazar inscripción
        </Button>
      </div>

      {showApproveDialog ? (
        <PlatformEnrollmentApplicationApproveDialog application={application} open onOpenChange={setShowApproveDialog} onApproved={handleResolved} />
      ) : null}

      {showRejectDialog ? (
        <PlatformEnrollmentApplicationRejectDialog application={application} open onOpenChange={setShowRejectDialog} onRejected={handleResolved} />
      ) : null}
    </>
  );
}
