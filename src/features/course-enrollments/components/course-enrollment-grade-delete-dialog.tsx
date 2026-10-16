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

import { COURSE_ENROLLMENT_GRADE_MESSAGES } from "@features/course-enrollments/constants/course-enrollment-grade.constants";
import type { CourseEnrollmentGrade } from "@features/course-enrollments/types/course-enrollment-grade.types";

type GradeDeleteDialogProps = {
  grade: CourseEnrollmentGrade | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (grade: CourseEnrollmentGrade) => Promise<{ error?: string }>;
  onDeleted: (grade: CourseEnrollmentGrade) => void;
};

type DeleteConfirmFormProps = {
  grade: CourseEnrollmentGrade;
  onOpenChange: (open: boolean) => void;
  onConfirm: (grade: CourseEnrollmentGrade) => Promise<{ error?: string }>;
  onDeleted: (grade: CourseEnrollmentGrade) => void;
};

function DeleteConfirmForm({ grade, onOpenChange, onConfirm, onDeleted }: DeleteConfirmFormProps): ReactElement {
  const [state, formAction, isPending] = useActionState(async (): Promise<{ error?: string }> => {
    const result = await safelyRunAction(onConfirm(grade), "No se pudo eliminar la nota.");

    if (result.error) {
      return { error: result.error };
    }

    if (grade.publicationStatus === "DRAFT") {
      toast.success("Borrador eliminado.");
    } else {
      toast.success("Nota marcada como pendiente de eliminación.");
    }

    onDeleted(grade);

    return {};
  }, {});

  function handleOpenChange(next: boolean): void {
    if (isPending && !next) {
      return;
    }

    onOpenChange(next);
  }

  return (
    <AlertDialog open onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-[calc(100%_-_2.5rem)]">
        <ActionForm action={formAction} className="space-y-4">
          <AlertDialogHeader>
            <AlertDialogTitle>{COURSE_ENROLLMENT_GRADE_MESSAGES.DELETE_GRADE}</AlertDialogTitle>
            <AlertDialogDescription>
              {grade.publicationStatus === "DRAFT"
                ? COURSE_ENROLLMENT_GRADE_MESSAGES.DELETE_DRAFT_CONFIRM
                : COURSE_ENROLLMENT_GRADE_MESSAGES.DELETE_PUBLISHED_CONFIRM}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {state.error ? (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          <AlertDialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? "Eliminando…" : "Confirmar"}
            </Button>
          </AlertDialogFooter>
        </ActionForm>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function CourseEnrollmentGradeDeleteDialog({ grade, onOpenChange, onConfirm, onDeleted }: GradeDeleteDialogProps): ReactElement {
  if (!grade) {
    return <></>;
  }

  return <DeleteConfirmForm key={grade.id} grade={grade} onOpenChange={onOpenChange} onConfirm={onConfirm} onDeleted={onDeleted} />;
}
