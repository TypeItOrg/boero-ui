"use client";

import * as React from "react";
import { CircleAlertIcon, UserCheckIcon } from "lucide-react";

import { Alert, AlertDescription } from "@common/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@common/components/ui/alert-dialog";
import { cn } from "@common/utils/cn.util";
import { safelyRunAction } from "@common/utils/safe-action.util";
import { approveEnrollmentApplicationAction } from "../actions/approve-enrollment-application.action";
import { ENROLLMENT_APPLICATION_ERROR_MESSAGES } from "../constants/enrollment-application-error-messages.constants";
import type { EnrollmentApplication } from "../types/enrollment-application.types";

type EnrollmentApplicationApproveDialogProps = {
  application: EnrollmentApplication;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApproved: () => void;
};

export function EnrollmentApplicationApproveDialog({
  application,
  open,
  onOpenChange,
  onApproved,
}: EnrollmentApplicationApproveDialogProps): React.ReactElement {
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string>();
  const applicantName = `${application.applicantFirstName} ${application.applicantLastName}`;

  function handleOpenChange(nextOpen: boolean): void {
    if (isPending && !nextOpen) return;
    if (!nextOpen) setError(undefined);
    onOpenChange(nextOpen);
  }

  function handleConfirm(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    setError(undefined);

    startTransition(async () => {
      const result = await safelyRunAction(
        approveEnrollmentApplicationAction(application.institutionId, application.applicationId),
        ENROLLMENT_APPLICATION_ERROR_MESSAGES.APPROVE,
      );
      if (!result.success) {
        setError(result.error ?? ENROLLMENT_APPLICATION_ERROR_MESSAGES.APPROVE);
        return;
      }

      onOpenChange(false);
      onApproved();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className={cn("mb-1 flex size-12 items-center justify-center rounded-2xl", "bg-emerald-500/10 text-emerald-600")}>
            <UserCheckIcon className="size-6" />
          </div>
          <AlertDialogTitle>Aprobar inscripción</AlertDialogTitle>
          <AlertDialogDescription>
            Vas a aprobar la inscripción de <span className="text-foreground font-semibold">{applicantName}</span> al{" "}
            <span className="text-foreground font-semibold">{application.studyPlanName}</span>. Se creará el registro del estudiante en la
            institución.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel size="lg" disabled={isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction size="lg" disabled={isPending} onClick={handleConfirm}>
            {isPending ? "Aprobando…" : "Aprobar inscripción"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
