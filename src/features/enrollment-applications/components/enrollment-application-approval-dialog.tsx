"use client";

import { useActionState, type ReactElement } from "react";

import { CircleAlertIcon, UserCheckIcon } from "lucide-react";

import { Alert, AlertDescription } from "@common/components/ui/alert";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@common/components/ui/alert-dialog";
import { Button } from "@common/components/ui/button";
import { cn } from "@common/utils/cn.util";
import { safelyRunAction } from "@common/utils/safe-action.util";

import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import type { EnrollmentApplicationActionState } from "@features/enrollment-applications/types/enrollment-application-action-state.types";
import type { EnrollmentApplicationApprovalDialogProps } from "@features/enrollment-applications/types/enrollment-application-approval-dialog-props.types";

export function EnrollmentApplicationApprovalDialog({
  application,
  approve,
  open,
  onOpenChange,
  onApproved,
}: EnrollmentApplicationApprovalDialogProps): ReactElement {
  const [state, formAction, isPending] = useActionState(async (): Promise<EnrollmentApplicationActionState> => {
    const result = await safelyRunAction(approve(), ENROLLMENT_MESSAGES.APPROVE);

    if (result.success) {
      onOpenChange(false);
      onApproved();
    }

    return result;
  }, {});

  const error = state.error;

  const actionLabel = application.canApproveProvisionally ? "Admitir provisoriamente" : "Confirmar inscripción definitiva";

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
            <AlertDialogTitle>{actionLabel}</AlertDialogTitle>
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
              {isPending ? "Aprobando…" : actionLabel}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
