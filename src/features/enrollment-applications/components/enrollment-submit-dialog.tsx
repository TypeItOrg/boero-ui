"use client";

import { useActionState } from "react";
import { CircleAlertIcon, SendIcon } from "lucide-react";
import type { z } from "zod";

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
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";

type EnrollmentSubmitDialogProps = {
  onClose: () => void;
  onSubmit: () => Promise<{ error?: string; issues?: z.ZodIssue[] }>;
};

export function EnrollmentSubmitDialog({ onClose, onSubmit }: EnrollmentSubmitDialogProps): React.ReactElement {
  const [state, action, pending] = useActionState(async () => onSubmit(), null);
  const error = state?.error ?? (state?.issues?.length ? ENROLLMENT_MESSAGES.INCOMPLETE_FIELDS_SUMMARY(state.issues.length) : undefined);

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
            <div className="bg-primary/10 text-primary mb-1 flex size-12 items-center justify-center rounded-2xl">
              <SendIcon className="size-6" aria-hidden="true" />
            </div>
            <AlertDialogTitle>¿Enviar solicitud de inscripción?</AlertDialogTitle>
            <AlertDialogDescription>
              Después de enviarla no podrás modificarla mientras la institución evalúa los datos presentados.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {error ? (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <AlertDialogFooter>
            <Button type="button" variant="outline" size="lg" disabled={pending} onClick={onClose}>
              Volver
            </Button>
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? "Enviando…" : "Enviar inscripción"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
