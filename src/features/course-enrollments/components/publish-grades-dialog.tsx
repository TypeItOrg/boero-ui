"use client";

import { useActionState } from "react";
import type { ReactElement } from "react";

import { CircleAlertIcon } from "lucide-react";
import { toast } from "sonner";

import { ActionForm } from "@common/components/action-form";
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

type PublishState = { error?: string };

function PublishConfirmForm({
  classId,
  mode,
  summary,
  onOpenChange,
  onPublished,
  label,
}: {
  classId: string;
  mode: "institutional" | "teacher";
  summary: PendingGradesSummary | null;
  onOpenChange: (open: boolean) => void;
  onPublished: () => void;
  label?: string;
}): ReactElement {
  const [state, formAction, isPending] = useActionState(async (): Promise<PublishState> => {
    const result = await safelyRunAction(
      mode === "teacher" ? publishTeacherGradesAction(classId) : publishInstitutionalGradesAction(classId),
      "No se pudieron publicar las notas.",
    );

    if (result.error) {
      return { error: result.error };
    }

    toast.success(COURSE_ENROLLMENT_GRADE_MESSAGES.PUBLISH_SUCCESS);
    onOpenChange(false);
    onPublished();

    return {};
  }, {});

  function handleOpenChange(next: boolean): void {
    if (isPending && !next) {
      return;
    }

    onOpenChange(next);
  }

  const pendingText =
    summary && summary.pendingChanges > 0
      ? `${summary.pendingChanges} ${summary.pendingChanges === 1 ? "cambio pendiente" : "cambios pendientes"} para ${summary.affectedStudents} ${summary.affectedStudents === 1 ? "estudiante" : "estudiantes"}.`
      : "Sin cambios pendientes.";

  return (
    <AlertDialog open onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-[calc(100%_-_2.5rem)]">
        <ActionForm action={formAction} className="space-y-4">
          <AlertDialogHeader>
            <AlertDialogTitle>{COURSE_ENROLLMENT_GRADE_MESSAGES.PUBLISH_CONFIRM_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>
              Esta publicación afecta a toda la clase: se publicarán todos los cambios pendientes de notas de esta clase.
              <span className="mt-2 block font-semibold">{pendingText}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          {state.error ? (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          <AlertDialogFooter>
            <Button type="button" variant="outline" size="lg" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="lg" disabled={isPending || !summary || summary.pendingChanges === 0}>
              {isPending ? "Publicando…" : (label ?? COURSE_ENROLLMENT_GRADE_MESSAGES.PUBLISH_GRADES)}
            </Button>
          </AlertDialogFooter>
        </ActionForm>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function PublishGradesDialog({ classId, mode, summary, open, onOpenChange, onPublished, label }: PublishGradesDialogProps): ReactElement {
  if (!open) {
    return <></>;
  }

  return (
    <PublishConfirmForm
      key={`${classId}-${mode}`}
      classId={classId}
      mode={mode}
      summary={summary}
      onOpenChange={onOpenChange}
      onPublished={onPublished}
      label={label}
    />
  );
}
