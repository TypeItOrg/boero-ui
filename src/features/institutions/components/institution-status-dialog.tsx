"use client";

import * as React from "react";
import { Building2Icon, CircleAlertIcon } from "lucide-react";

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
import { updateInstitutionStatusAction } from "@features/institutions/actions/update-institution-status.action";
import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";

type InstitutionStatusDialogProps = {
  institutionId: string;
  institutionName: string;
  active: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
};

export function InstitutionStatusDialog({
  institutionId,
  institutionName,
  active,
  open,
  onOpenChange,
  onUpdated,
}: InstitutionStatusDialogProps): React.ReactElement {
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string>();
  const nextActive = !active;
  const actionLabel = nextActive ? "Activar institución" : "Desactivar institución";

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
        updateInstitutionStatusAction(institutionId, nextActive),
        INSTITUTION_ERROR_MESSAGES.UPDATE_STATUS(nextActive),
      );

      if (result.error) {
        setError(result.error);
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
              nextActive ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive",
            )}
          >
            <Building2Icon className="size-6" />
          </div>
          <AlertDialogTitle>{actionLabel}</AlertDialogTitle>
          <AlertDialogDescription>
            {nextActive ? (
              <>
                <span className="text-foreground font-semibold">{institutionName}</span> volverá a estar activa en la plataforma.
              </>
            ) : (
              <>
                <span className="text-foreground font-semibold">{institutionName}</span> perderá el acceso y se suspenderán sus operaciones.
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
          <AlertDialogAction size="lg" variant={nextActive ? "default" : "destructive"} disabled={isPending} onClick={handleConfirm}>
            {isPending ? (nextActive ? "Activando…" : "Desactivando…") : actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
