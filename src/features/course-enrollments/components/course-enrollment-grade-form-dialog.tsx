"use client";

import { ActionForm } from "@common/components/action-form";
import { safelyRunAction } from "@common/utils/safe-action.util";
import * as React from "react";
import { CircleAlertIcon } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@common/components/ui/dialog";
import { Field, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import {
  createInstitutionalGradeAction,
  createTeacherGradeAction,
  updateInstitutionalGradeAction,
  updateTeacherGradeAction,
} from "@features/course-enrollments/actions/course-enrollment-grade.actions";
import { COURSE_ENROLLMENT_GRADE_MESSAGES } from "@features/course-enrollments/constants/course-enrollment-grade.constants";
import type { CourseEnrollmentGrade } from "@features/course-enrollments/types/course-enrollment-grade.types";

type GradeFormDialogProps = {
  mode: "institutional" | "teacher";
  enrollmentId: string;
  classId?: string;
  grade?: CourseEnrollmentGrade;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export function CourseEnrollmentGradeFormDialog({
  mode,
  enrollmentId,
  classId,
  grade,
  open,
  onOpenChange,
  onSaved,
}: GradeFormDialogProps): React.ReactElement {
  const [state, formAction, isPending] = React.useActionState(async (_previous: { error?: string }, formData: FormData) => {
    async function run(): Promise<{ error?: string; draft?: boolean; pending?: boolean }> {
      if (grade) {
        if (mode === "teacher") {
          if (!classId) {
            return { error: "Falta la clase." };
          }

          return updateTeacherGradeAction(classId, enrollmentId, grade.id, grade.version, formData);
        }

        return updateInstitutionalGradeAction(enrollmentId, grade.id, grade.version, formData);
      }

      if (mode === "teacher") {
        if (!classId) {
          return { error: "Falta la clase." };
        }

        return createTeacherGradeAction(classId, enrollmentId, formData);
      }

      return createInstitutionalGradeAction(enrollmentId, formData);
    }

    const result = await safelyRunAction(run(), COURSE_ENROLLMENT_GRADE_MESSAGES.MUTATION_FAILED);

    if (!result.error) {
      if (result.draft) {
        toast.success(COURSE_ENROLLMENT_GRADE_MESSAGES.DRAFT_SAVED);
      } else if (result.pending) {
        toast.success(COURSE_ENROLLMENT_GRADE_MESSAGES.CHANGES_SAVED);
      }

      onOpenChange(false);
      onSaved();
    }

    return result;
  }, {});

  function handleOpenChange(nextOpen: boolean): void {
    if (isPending && !nextOpen) {
      return;
    }

    onOpenChange(nextOpen);
  }

  if (!open) {
    return <></>;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <ActionForm action={formAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{grade ? COURSE_ENROLLMENT_GRADE_MESSAGES.EDIT_GRADE : COURSE_ENROLLMENT_GRADE_MESSAGES.ADD_GRADE}</DialogTitle>
            <DialogDescription>Las notas se guardan como borrador hasta publicar la clase.</DialogDescription>
          </DialogHeader>
          {state.error ? (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          <Field>
            <FieldLabel htmlFor="evaluation" required>
              Evaluación
            </FieldLabel>
            <Input
              id="evaluation"
              name="evaluation"
              required
              maxLength={150}
              disabled={isPending}
              defaultValue={grade?.evaluation ?? ""}
              placeholder="Parcial 1"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="value" required>
              Nota
            </FieldLabel>
            <Input
              id="value"
              name="value"
              type="number"
              required
              min={1}
              max={10}
              step={0.01}
              disabled={isPending}
              defaultValue={grade ? String(grade.value) : ""}
              placeholder="7,50"
            />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" size="lg" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? "Guardando…" : COURSE_ENROLLMENT_GRADE_MESSAGES.SAVE_GRADE}
            </Button>
          </DialogFooter>
        </ActionForm>
      </DialogContent>
    </Dialog>
  );
}
