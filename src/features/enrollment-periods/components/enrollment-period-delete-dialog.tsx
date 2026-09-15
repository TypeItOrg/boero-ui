"use client";

import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@common/components/ui/button";
import {
  AlertDialog,
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
            <AlertDialogTitle>¿Eliminar período de inscripción?</AlertDialogTitle>
            <AlertDialogDescription>El período dejará de estar disponible para nuevas inscripciones.</AlertDialogDescription>
          </AlertDialogHeader>
          {state.error && (
            <p role="alert" className="text-destructive my-3 text-sm">
              {state.error}
            </p>
          )}
          <AlertDialogFooter>
            <Button type="button" variant="outline" disabled={pending} onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Eliminando…" : "Eliminar período"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
