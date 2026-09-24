"use client";

import { startTransition, useActionState, type SyntheticEvent } from "react";
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
  institutionId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function UnlinkGuardianDependentDialog({
  dependentName,
  dependentPersonId,
  institutionId,
  onClose,
  onSuccess,
}: UnlinkGuardianDependentDialogProps): React.ReactElement {
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
            <AlertDialogTitle>Quitar a {dependentName}</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a perder el acceso a las solicitudes de inscripción de esta persona. Las solicitudes no se eliminan.
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
              Cancelar
            </AlertDialogCancel>
            <Button disabled={isPending} type="submit" variant="destructive">
              {isPending ? "Quitando…" : "Quitar"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
