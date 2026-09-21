"use client";

import { ActionForm } from "@common/components/action-form";

import * as React from "react";
import { useActionState } from "react";
import { CircleAlertIcon, CircleXIcon } from "lucide-react";

import { Alert, AlertDescription } from "@common/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@common/components/ui/alert-dialog";
import { Button } from "@common/components/ui/button";
import { Field, FieldContent, FieldError, FieldLabel } from "@common/components/ui/field";
import { Textarea } from "@common/components/ui/textarea";
import { cn } from "@common/utils/cn.util";
import { rejectPlatformEnrollmentApplicationAction } from "@features/enrollment-applications/actions/reject-platform-enrollment-application.action";
import type { EnrollmentApplicationRejectActionState } from "@features/enrollment-applications/types/enrollment-application-reject-action-state.types";
import type { PlatformEnrollmentApplicationSummary } from "@features/enrollment-applications/types/platform-enrollment-application-summary.types";

const INITIAL_STATE: EnrollmentApplicationRejectActionState = {};

type PlatformEnrollmentApplicationRejectDialogProps = {
  application: PlatformEnrollmentApplicationSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRejected: () => void;
};

export function PlatformEnrollmentApplicationRejectDialog({
  application,
  open,
  onOpenChange,
  onRejected,
}: PlatformEnrollmentApplicationRejectDialogProps): React.ReactElement {
  const [state, formAction, isPending] = useActionState(
    rejectPlatformEnrollmentApplicationAction.bind(null, application.institutionId, application.applicationId),
    INITIAL_STATE,
  );
  const hasRejectionReasonError = Boolean(state.fieldErrors?.rejectionReason);

  React.useEffect(() => {
    if (state.success) {
      onRejected();
    }
  }, [state.success, onRejected]);

  function handleOpenChange(nextOpen: boolean): void {
    if (isPending && !nextOpen) {
      return;
    }

    onOpenChange(nextOpen);
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <ActionForm action={formAction} className="space-y-4" noValidate>
          <AlertDialogHeader>
            <div className="bg-destructive/10 text-destructive mb-1 flex size-12 items-center justify-center rounded-2xl">
              <CircleXIcon className="size-6" />
            </div>
            <AlertDialogTitle>Rechazar inscripción</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a rechazar la inscripción de <span className="text-foreground font-semibold">{application.applicantName}</span>. El motivo quedará
              visible para el postulante.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-1">
            <Field data-invalid={hasRejectionReasonError}>
              <FieldContent>
                <FieldLabel htmlFor="rejectionReason" required>
                  Motivo de rechazo
                </FieldLabel>
              </FieldContent>
              <Textarea
                aria-invalid={hasRejectionReasonError}
                className={cn(hasRejectionReasonError && "border-destructive")}
                id="rejectionReason"
                maxLength={1000}
                name="rejectionReason"
                required
                rows={4}
              />
              <FieldError errors={state.fieldErrors?.rejectionReason ? [{ message: state.fieldErrors.rejectionReason }] : undefined} />
            </Field>
          </div>

          {state.error ? (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel type="button" size="lg" disabled={isPending}>
              Cancelar
            </AlertDialogCancel>
            <Button type="submit" size="lg" variant="destructive" disabled={isPending}>
              {isPending ? "Rechazando…" : "Rechazar inscripción"}
            </Button>
          </AlertDialogFooter>
        </ActionForm>
      </AlertDialogContent>
    </AlertDialog>
  );
}
