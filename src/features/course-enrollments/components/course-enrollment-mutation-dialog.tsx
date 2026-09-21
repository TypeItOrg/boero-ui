"use client";

import { ActionForm } from "@common/components/action-form";
import { safelyRunAction } from "@common/utils/safe-action.util";

import * as React from "react";
import { CircleAlertIcon, GraduationCapIcon, UserMinusIcon } from "lucide-react";

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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";
import { Textarea } from "@common/components/ui/textarea";
import { updateCourseAcademicStatusAction, withdrawCourseEnrollmentAction } from "@features/course-enrollments/actions/course-enrollment.actions";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";
import { ACADEMIC_ENROLLMENT_STATUS } from "@features/course-enrollments/types/academic-enrollment-status.types";
import { ACADEMIC_ENROLLMENT_STATUS_LABELS, COURSE_ENROLLMENT_MESSAGES } from "@features/course-enrollments/constants/course-enrollment.constants";

type CourseEnrollmentMutationDialogProps = {
  enrollment: CourseEnrollment;
  mode: "withdraw" | "academic";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
};

const ACADEMIC_STATUS_OPTIONS = [
  ACADEMIC_ENROLLMENT_STATUS.REGULARIZED,
  ACADEMIC_ENROLLMENT_STATUS.PROMOTED,
  ACADEMIC_ENROLLMENT_STATUS.PASSED,
  ACADEMIC_ENROLLMENT_STATUS.FAILED,
].map((value) => ({
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

    const result = await safelyRunAction(
      mode === "withdraw"
        ? withdrawCourseEnrollmentAction(
            enrollment.id,
            formData.get("type") === "VOLUNTARY" ? "VOLUNTARY" : "ADMINISTRATIVE",
            reason,
            enrollment.version,
          )
        : updateCourseAcademicStatusAction(enrollment.id, String(formData.get("status") ?? ""), reason, enrollment.version),
      COURSE_ENROLLMENT_MESSAGES.MUTATION_UNAVAILABLE,
    );

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

  const availableAcademicStatusOptions = ACADEMIC_STATUS_OPTIONS;
  const defaultAcademicStatus = availableAcademicStatusOptions.some((option) => option.value === enrollment.academicStatus)
    ? enrollment.academicStatus
    : undefined;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <ActionForm action={formAction} className="space-y-4">
          <AlertDialogHeader>
            <div
              className={
                mode === "withdraw"
                  ? "bg-destructive/10 text-destructive mb-1 flex size-12 items-center justify-center rounded-2xl"
                  : "bg-primary/10 text-primary mb-1 flex size-12 items-center justify-center rounded-2xl"
              }
            >
              {mode === "withdraw" ? (
                <UserMinusIcon className="size-6" aria-hidden="true" />
              ) : (
                <GraduationCapIcon className="size-6" aria-hidden="true" />
              )}
            </div>
            <AlertDialogTitle>{mode === "withdraw" ? "Registrar baja" : "Registrar resultado"}</AlertDialogTitle>
            <AlertDialogDescription>
              {mode === "withdraw" ? "Estás por registrar la baja de " : "Estás por registrar el resultado académico de "}
              <span className="text-foreground font-semibold">{enrollment.studentName}</span> en{" "}
              <span className="text-foreground font-semibold">{enrollment.academicSpaceName}</span>.
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
              <Select name="type" defaultValue="ADMINISTRATIVE" disabled={isPending} required>
                <SelectTrigger id="type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="ADMINISTRATIVE" className="px-2.5 py-1.5">
                      Baja administrativa
                    </SelectItem>
                    <SelectItem value="VOLUNTARY" className="px-2.5 py-1.5">
                      Baja voluntaria
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          ) : (
            <Field>
              <FieldLabel htmlFor="status" required>
                Resultado
              </FieldLabel>
              <Select name="status" defaultValue={defaultAcademicStatus} disabled={isPending} required>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Seleccioná un resultado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {availableAcademicStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="px-2.5 py-1.5">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
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
              {isPending ? "Guardando…" : mode === "withdraw" ? "Registrar baja" : "Registrar resultado"}
            </Button>
          </AlertDialogFooter>
        </ActionForm>
      </AlertDialogContent>
    </AlertDialog>
  );
}
