"use client";

import { ActionForm } from "@common/components/action-form";

import * as React from "react";
import { CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@common/components/ui/alert-dialog";
import { Field, FieldLabel } from "@common/components/ui/field";
import { Textarea } from "@common/components/ui/textarea";
import { updateCourseAcademicStatusAction, withdrawCourseEnrollmentAction } from "@features/course-enrollments/actions/course-enrollment.actions";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";
import { COURSE_ENROLLMENT_STATUS } from "@features/course-enrollments/types/course-enrollment-status.types";
import { ACADEMIC_ENROLLMENT_STATUS } from "@features/course-enrollments/types/academic-enrollment-status.types";
import { ACADEMIC_ENROLLMENT_STATUS_LABELS } from "@features/course-enrollments/constants/course-enrollment.constants";

type CourseEnrollmentMutationDialogProps = {
  enrollment: CourseEnrollment;
  mode: "withdraw" | "academic";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
};

const ACADEMIC_STATUS_OPTIONS = Object.values(ACADEMIC_ENROLLMENT_STATUS).map((value) => ({
  value,
  label: ACADEMIC_ENROLLMENT_STATUS_LABELS[value],
}));

export function CourseEnrollmentMutationDialog({
  enrollment,
  mode,
  open,
  onOpenChange,
  onUpdated,
}: CourseEnrollmentMutationDialogProps): React.ReactElement {
  const [state, formAction, isPending] = React.useActionState(async (_previous: { error?: string }, formData: FormData) => {
    const reason = formData.get("reason");

    if (typeof reason !== "string" || !reason.trim()) {
      return { error: "Debés indicar el motivo de la operación." };
    }

    const result =
      mode === "withdraw"
        ? await withdrawCourseEnrollmentAction(
            enrollment.id,
            formData.get("type") === "VOLUNTARY" ? "VOLUNTARY" : "ADMINISTRATIVE",
            reason,
            enrollment.version,
          )
        : await updateCourseAcademicStatusAction(enrollment.id, String(formData.get("status") ?? ""), reason, enrollment.version);

    if (!result.error) {
      onOpenChange(false);
      onUpdated();
    }

    return result;
  }, {});

  function handleOpenChange(nextOpen: boolean): void {
    if (isPending && !nextOpen) {
      return;
    }

    onOpenChange(nextOpen);
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <ActionForm action={formAction} className="space-y-4">
          <AlertDialogHeader>
            <AlertDialogTitle>{mode === "withdraw" ? "Registrar baja" : "Actualizar resultado académico"}</AlertDialogTitle>
            <AlertDialogDescription>
              {enrollment.academicSpaceName} · {enrollment.studentName}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {state.error ? (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}

          {mode === "withdraw" ? (
            <Field>
              <FieldLabel htmlFor="type" required>
                Tipo de baja
              </FieldLabel>
              <select
                id="type"
                name="type"
                defaultValue="ADMINISTRATIVE"
                disabled={isPending}
                className="border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
              >
                <option value="ADMINISTRATIVE">Baja administrativa</option>
                <option value="VOLUNTARY">Baja voluntaria</option>
              </select>
            </Field>
          ) : (
            <Field>
              <FieldLabel htmlFor="status" required>
                Resultado
              </FieldLabel>
              <select
                id="status"
                name="status"
                defaultValue={enrollment.academicStatus}
                disabled={isPending}
                className="border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
              >
                {ACADEMIC_STATUS_OPTIONS.filter(
                  (option) => enrollment.status !== COURSE_ENROLLMENT_STATUS.COMPLETED || option.value !== ACADEMIC_ENROLLMENT_STATUS.IN_PROGRESS,
                ).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field>
            <FieldLabel htmlFor="reason" required>
              Motivo
            </FieldLabel>
            <Textarea id="reason" name="reason" minLength={1} maxLength={1000} required disabled={isPending} />
          </Field>

          <AlertDialogFooter>
            <Button type="button" variant="outline" size="lg" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="lg" variant={mode === "withdraw" ? "destructive" : "default"} disabled={isPending}>
              {isPending ? "Guardando…" : mode === "withdraw" ? "Registrar baja" : "Guardar resultado"}
            </Button>
          </AlertDialogFooter>
        </ActionForm>
      </AlertDialogContent>
    </AlertDialog>
  );
}
