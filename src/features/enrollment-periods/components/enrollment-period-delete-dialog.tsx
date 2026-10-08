"use client";

import { CircleAlertIcon, Trash2Icon } from "lucide-react";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@common/components/ui/alert-dialog";
import { deleteEnrollmentPeriodAction } from "@features/enrollment-periods/actions/enrollment-period.actions";
import type { EnrollmentPeriodActionState } from "@features/enrollment-periods/types/enrollment-period-action-state.types";

export function EnrollmentPeriodDeleteDialog({
  institutionId,
  periodId,
  scope,
  onClose,
}: {
  institutionId: string;
  periodId: string;
  scope: AcademicScope;
  onClose: () => void;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(async (): Promise<EnrollmentPeriodActionState> => {
    const result = await deleteEnrollmentPeriodAction(institutionId, periodId, scope);

    if (result.success) {
      onClose();
      router.refresh();
    }

    return result;
  }, {});

  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) {
          onClose();
        }
      }}
    >
      <AlertDialogContent>
        <form action={action}>
          <AlertDialogHeader>
            <div className="bg-destructive/10 text-destructive mb-1 flex size-12 items-center justify-center rounded-2xl">
              <Trash2Icon className="size-6" aria-hidden="true" />
            </div>
            <AlertDialogTitle>¿Eliminar período de inscripción?</AlertDialogTitle>
            <AlertDialogDescription>El período dejará de estar disponible para nuevas inscripciones.</AlertDialogDescription>
          </AlertDialogHeader>
          {state.error ? (
            <Alert className="mt-4" variant="destructive">
              <CircleAlertIcon aria-hidden="true" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          <AlertDialogFooter className="mt-5">
            <AlertDialogCancel type="button" disabled={pending}>
              Cancelar
            </AlertDialogCancel>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Eliminando…" : "Eliminar período"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
