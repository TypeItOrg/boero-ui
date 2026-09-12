"use client";

import * as React from "react";
import { useActionState } from "react";
import { CircleAlertIcon, CircleXIcon } from "lucide-react";

import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@common/components/ui/dialog";
import { Field, FieldContent, FieldError, FieldLabel } from "@common/components/ui/field";
import { Textarea } from "@common/components/ui/textarea";
import { cn } from "@common/utils/cn.util";
import { rejectPlatformEnrollmentApplicationAction } from "../actions/reject-platform-enrollment-application.action";
import type { EnrollmentApplicationRejectActionState } from "../types/enrollment-application-reject-action-state.types";
import type { PlatformEnrollmentApplicationSummary } from "../types/enrollment-application.types";

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
    if (isPending && !nextOpen) return;
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <div className="bg-destructive/10 text-destructive mb-1 flex size-12 items-center justify-center rounded-2xl">
              <CircleXIcon className="size-6" />
            </div>
            <DialogTitle>Rechazar inscripción</DialogTitle>
            <DialogDescription>
              Vas a rechazar la inscripción de <span className="text-foreground font-semibold">{application.applicantName}</span> al{" "}
              <span className="text-foreground font-semibold">{application.studyPlanName}</span>. El motivo quedará visible para el postulante.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
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
                placeholder="Indicá el motivo del rechazo, por ejemplo documentación incompleta."
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

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" size="lg" variant="outline" disabled={isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" size="lg" variant="destructive" disabled={isPending}>
              {isPending ? "Rechazando…" : "Rechazar inscripción"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
