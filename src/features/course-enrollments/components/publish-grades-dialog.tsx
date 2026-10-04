"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@common/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@common/components/ui/alert-dialog";
import { safelyRunAction } from "@common/utils/safe-action.util";
import { publishInstitutionalGradesAction, publishTeacherGradesAction } from "@features/course-enrollments/actions/course-enrollment-grade.actions";
import { COURSE_ENROLLMENT_GRADE_MESSAGES } from "@features/course-enrollments/constants/course-enrollment-grade.constants";
import type { PendingGradesSummary } from "@features/course-enrollments/types/pending-grades-summary.types";

type PublishGradesDialogProps = {
  classId: string;
  mode: "institutional" | "teacher";
  summary: PendingGradesSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublished: () => void;
  label?: string;
};

export function PublishGradesDialog({
  classId,
  mode,
  summary,
  open,
  onOpenChange,
  onPublished,
  label,
}: PublishGradesDialogProps): React.ReactElement {
  const [isPending, setIsPending] = React.useState(false);

  if (!open) {
    return <></>;
  }

  async function handlePublish(): Promise<void> {
    setIsPending(true);

    const result = await safelyRunAction(
      mode === "teacher" ? publishTeacherGradesAction(classId) : publishInstitutionalGradesAction(classId),
      "No se pudieron publicar las notas.",
    );

    setIsPending(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(COURSE_ENROLLMENT_GRADE_MESSAGES.PUBLISH_SUCCESS);
    onOpenChange(false);
    onPublished();
  }

  const pendingText =
    summary && summary.pendingChanges > 0
      ? `${summary.pendingChanges} ${summary.pendingChanges === 1 ? "cambio pendiente" : "cambios pendientes"} para ${summary.affectedStudents} ${summary.affectedStudents === 1 ? "estudiante" : "estudiantes"}.`
      : "Sin cambios pendientes.";

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{COURSE_ENROLLMENT_GRADE_MESSAGES.PUBLISH_CONFIRM_TITLE}</AlertDialogTitle>
          <AlertDialogDescription>
            Se publicarán todos los cambios pendientes de notas de esta clase.
            <span className="mt-2 block font-semibold">{pendingText}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button type="button" variant="outline" size="lg" disabled={isPending} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" size="lg" disabled={isPending || !summary || summary.pendingChanges === 0} onClick={() => void handlePublish()}>
            {isPending ? "Publicando…" : (label ?? COURSE_ENROLLMENT_GRADE_MESSAGES.PUBLISH_GRADES)}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
