"use client";

import { startTransition, useActionState, type SyntheticEvent, type ReactElement } from "react";

import { CircleAlertIcon, UserMinusIcon } from "lucide-react";

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

import { unlinkGuardianDependentAction } from "@features/guardian-dependents/actions/unlink-guardian-dependent.action";
import { GUARDIAN_DEPENDENT_MESSAGES } from "@features/guardian-dependents/constants/guardian-dependent.constants";
import type { GuardianDependentActionState } from "@features/guardian-dependents/types/guardian-dependent-action-state.types";

type UnlinkGuardianDependentDialogProps = {
  dependentName: string;
  dependentPersonId: string;
  dependentDocumentNumber: string;
  institutionId: string;
  isPendingRequest: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function UnlinkGuardianDependentDialog({
  dependentName,
  dependentPersonId,
  dependentDocumentNumber,
  institutionId,
  isPendingRequest,
  onClose,
  onSuccess,
}: UnlinkGuardianDependentDialogProps): ReactElement {
  const [state, action, isPending] = useActionState<GuardianDependentActionState, FormData>(async () => {
    try {
      const result = await unlinkGuardianDependentAction(institutionId, dependentPersonId);

      if (result.success) {
        onSuccess();
      }

      return result;
    } catch {
      return { error: GUARDIAN_DEPENDENT_MESSAGES.UNLINK };
    }
  }, {});

  const submitLabel = isPendingRequest ? "Cancelar solicitud" : "Quitar";

  const pendingLabel = isPendingRequest ? "Cancelando…" : "Quitando…";

  let title = isPendingRequest ? "Cancelar solicitud de vinculación" : "Quitar vinculación";

  if (dependentName) {
    title = isPendingRequest ? `Cancelar solicitud de ${dependentName}` : `Quitar a ${dependentName}`;
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (isPending) {
      return;
    }

    startTransition(() => action(new FormData()));
  }

  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open && !isPending) {
          onClose();
        }
      }}
    >
      <AlertDialogContent>
        <form onSubmit={handleSubmit}>
          <AlertDialogHeader>
            <div className="bg-destructive/10 text-destructive mb-1 flex size-12 items-center justify-center rounded-2xl">
              <UserMinusIcon aria-hidden="true" className="size-6" />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="mb-2 block font-medium">Documento: {dependentDocumentNumber}</span>
              {isPendingRequest
                ? "La institución ya no podrá aprobar esta solicitud de vinculación."
                : "Vas a perder el acceso a las solicitudes de inscripción de esta persona. Las solicitudes no se eliminan."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {state.error ? (
            <Alert className="mt-4" variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          <AlertDialogFooter className="mt-5">
            <AlertDialogCancel disabled={isPending} type="button">
              {isPendingRequest ? "Volver" : "Cancelar"}
            </AlertDialogCancel>
            <Button disabled={isPending} type="submit" variant="destructive">
              {isPending ? pendingLabel : submitLabel}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
