"use client";

import * as React from "react";
import { CircleAlertIcon, UserCheckIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import type { EnrollmentApplicationActionState } from "@features/enrollment-applications/types/enrollment-application-action-state.types";
import { Alert, AlertDescription } from "@common/components/ui/alert";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@common/components/ui/alert-dialog";
import { cn } from "@common/utils/cn.util";
import { safelyRunAction } from "@common/utils/safe-action.util";
import { approveEnrollmentApplicationAction } from "@features/enrollment-applications/actions/approve-enrollment-application.action";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import type { EnrollmentApplicationReviewSummary } from "@features/enrollment-applications/types/enrollment-application-review-summary.types";

type EnrollmentApplicationApproveDialogProps = {
  application: EnrollmentApplicationReviewSummary;
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
  const [state, formAction, isPending] = React.useActionState(async (): Promise<EnrollmentApplicationActionState> => {
    const result = await safelyRunAction(
      approveEnrollmentApplicationAction(application.institutionId, application.applicationId, application.canApproveProvisionally === true),
      ENROLLMENT_MESSAGES.APPROVE,
    );

    if (result.success) {
      onOpenChange(false);
      onApproved();
    }

    return result;
  }, {});
  const error = state.error;

  function handleOpenChange(nextOpen: boolean): void {
    if (!isPending) {
      onOpenChange(nextOpen);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <form action={formAction} className="space-y-4">
          <AlertDialogHeader>
            <div className={cn("mb-1 flex size-12 items-center justify-center rounded-2xl", "bg-emerald-500/10 text-emerald-600")}>
              <UserCheckIcon className="size-6" />
            </div>
            <AlertDialogTitle>
              {application.canApproveProvisionally ? "Admitir provisoriamente" : "Confirmar inscripción definitiva"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {application.canApproveProvisionally ? "Vas a admitir provisoriamente a " : "Vas a confirmar definitivamente la inscripción de "}
              <span className="text-foreground font-semibold">{application.applicantName}</span>.
              {application.canApproveProvisionally
                ? " Podrá continuar con su incorporación a cursos y completar la documentación pendiente."
                : " Todos los documentos obligatorios están aceptados."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {error ? (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <AlertDialogFooter>
            <Button type="button" variant="outline" size="lg" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? "Aprobando…" : application.canApproveProvisionally ? "Admitir provisoriamente" : "Confirmar inscripción definitiva"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
