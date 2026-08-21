"use client";

import * as React from "react";
import { CircleAlertIcon, UserCheckIcon, UserXIcon } from "lucide-react";

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
import { updatePersonStatusAction } from "@features/people/actions/update-person-status.action";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";

type PersonStatusDialogProps = {
  institutionId: string;
  personId: string;
  personName: string;
  enabled: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
};

export function PersonStatusDialog({
  institutionId,
  personId,
  personName,
  enabled,
  open,
  onOpenChange,
  onUpdated,
}: PersonStatusDialogProps): React.ReactElement {
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string>();
  const nextEnabled = !enabled;
  const actionLabel = nextEnabled ? "Activar usuario" : "Desactivar usuario";

  function handleOpenChange(nextOpen: boolean): void {
    if (isPending && !nextOpen) return;
    if (!nextOpen) setError(undefined);
    onOpenChange(nextOpen);
  }

  function handleConfirm(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    setError(undefined);

    startTransition(async () => {
      const result = await safelyRunAction(updatePersonStatusAction(institutionId, personId, nextEnabled), PEOPLE_ERROR_MESSAGES.UPDATE_STATUS);
      if (!result.success) {
        setError(result.error ?? PEOPLE_ERROR_MESSAGES.UPDATE_STATUS);
        return;
      }

      onOpenChange(false);
      onUpdated();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div
            className={cn(
              "mb-1 flex size-12 items-center justify-center rounded-2xl",
              nextEnabled ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive",
            )}
          >
            {nextEnabled ? <UserCheckIcon className="size-6" /> : <UserXIcon className="size-6" />}
          </div>
          <AlertDialogTitle>{actionLabel}</AlertDialogTitle>
          <AlertDialogDescription>
            {nextEnabled ? (
              <>
                <span className="text-foreground font-semibold">{personName}</span> recuperará el acceso al portal institucional.
              </>
            ) : (
              <>
                <span className="text-foreground font-semibold">{personName}</span> perderá el acceso y se cerrarán todas sus sesiones activas.
              </>
            )}
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
          <AlertDialogAction size="lg" variant={nextEnabled ? "default" : "destructive"} disabled={isPending} onClick={handleConfirm}>
            {isPending ? "Actualizando…" : actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
