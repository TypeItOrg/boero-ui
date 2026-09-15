"use client";

import { useActionState } from "react";
import { BanIcon, CircleAlertIcon } from "lucide-react";

import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import { safelyRunAction } from "@common/utils/safe-action.util";
import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@common/components/ui/alert-dialog";
import { cancelEnrollmentApplicationAction } from "@features/enrollment-applications/actions/enrollment-application.actions";
import type { ChangeEnrollmentCareerResult } from "@features/enrollment-applications/types/change-enrollment-career-result.types";
import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";

export function EnrollmentCancelDialog({
  applicationId,
  beforeCancel,
  onClose,
  onCancelled,
}: {
  applicationId: string;
  beforeCancel?: () => Promise<void>;
  onClose: () => void;
  onCancelled: (application: EnrollmentApplicationResponse) => void;
}) {
  const [state, action, pending] = useActionState(async (): Promise<ChangeEnrollmentCareerResult> => {
    const result = await safelyRunAction(
      (async () => {
        await beforeCancel?.();

        return cancelEnrollmentApplicationAction(applicationId);
      })(),
      ENROLLMENT_MESSAGES.CANCEL_APPLICATION_FAILED,
    );

    if (result.application) {
      onCancelled(result.application);
      onClose();
    }

    return result;
  }, null);

  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) {
          onClose();
        }
      }}
    >
      <AlertDialogContent asChild className="sm:max-w-md">
        <form action={action}>
          <AlertDialogHeader>
            <div className="bg-destructive/10 text-destructive mb-1 flex size-12 items-center justify-center rounded-2xl">
              <BanIcon className="size-6" aria-hidden="true" />
            </div>
            <AlertDialogTitle>¿Cancelar el borrador de inscripción?</AlertDialogTitle>
            <AlertDialogDescription>
              La solicitud quedará cancelada y ya no podrás continuar editándola. Podrás iniciar otra inscripción más adelante.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {state?.error ? (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}

          <AlertDialogFooter>
            <Button type="button" variant="outline" size="lg" disabled={pending} onClick={onClose}>
              Conservar borrador
            </Button>
            <Button type="submit" variant="destructive" size="lg" disabled={pending}>
              {pending ? "Cancelando…" : "Cancelar inscripción"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
