"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BadgeCheckIcon, BanIcon, ShieldCheckIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@common/components/ui/card";
import { EnrollmentApplicationStatusBadge } from "./enrollment-application-status-badge";
import { PlatformEnrollmentApplicationApproveDialog } from "./platform-enrollment-application-approve-dialog";
import { PlatformEnrollmentApplicationRejectDialog } from "./platform-enrollment-application-reject-dialog";
import type { EnrollmentApplicationStatus } from "../types/enrollment-application-status.types";
import type { PlatformEnrollmentApplicationSummary } from "../types/enrollment-application.types";

type PlatformEnrollmentApplicationResolvePanelProps = {
  application: PlatformEnrollmentApplicationSummary;
  status: EnrollmentApplicationStatus;
};

export function PlatformEnrollmentApplicationResolvePanel({
  application,
  status,
}: PlatformEnrollmentApplicationResolvePanelProps): React.ReactElement {
  const router = useRouter();
  const [showApproveDialog, setShowApproveDialog] = React.useState(false);
  const [showRejectDialog, setShowRejectDialog] = React.useState(false);

  function handleResolved(): void {
    setShowApproveDialog(false);
    setShowRejectDialog(false);
    router.refresh();
  }

  return (
    <>
      <Card className="bg-muted/25 gap-3 p-4">
        <CardHeader className="p-0">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg">
              <ShieldCheckIcon className="size-4" aria-hidden="true" />
            </div>
            <CardTitle className="text-base">Resolución</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 p-0">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Estado</span>
            <EnrollmentApplicationStatusBadge status={status} />
          </div>

          {status === "SUBMITTED" ? (
            <div className="flex flex-col gap-1.5">
              <Button type="button" size="sm" onClick={() => setShowApproveDialog(true)}>
                <BadgeCheckIcon />
                Aprobar inscripción
              </Button>
              <Button type="button" size="sm" variant="destructive" onClick={() => setShowRejectDialog(true)}>
                <BanIcon />
                Rechazar inscripción
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground text-xs italic">
              Esta solicitud ya fue resuelta y no admite nuevas acciones de aprobación o rechazo.
            </p>
          )}
        </CardContent>
      </Card>

      {showApproveDialog ? (
        <PlatformEnrollmentApplicationApproveDialog application={application} open onOpenChange={setShowApproveDialog} onApproved={handleResolved} />
      ) : null}

      {showRejectDialog ? (
        <PlatformEnrollmentApplicationRejectDialog application={application} open onOpenChange={setShowRejectDialog} onRejected={handleResolved} />
      ) : null}
    </>
  );
}
