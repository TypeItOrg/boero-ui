"use client";

import * as React from "react";
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
import { Button } from "@common/components/ui/button";
import { cancelEnrollmentApplicationAction } from "../actions/enrollment-application.actions";

type EnrollmentApplicationCancelButtonProps = {
  applicationId: string;
  onSuccess?: () => void;
};

export function EnrollmentApplicationCancelButton({ applicationId, onSuccess }: EnrollmentApplicationCancelButtonProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);

  const handleCancel = async () => {
    setIsPending(true);
    try {
      await cancelEnrollmentApplicationAction(applicationId);
      setOpen(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cancelar";
      alert(msg);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2 text-xs"
        disabled={isPending}
      >
        {isPending ? "Cancelando…" : "Cancelar"}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar inscripción?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción cancelará tu solicitud de inscripción. No podrás recuperarla.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Mantener</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
              {isPending ? "Cancelando…" : "Cancelar inscripción"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
