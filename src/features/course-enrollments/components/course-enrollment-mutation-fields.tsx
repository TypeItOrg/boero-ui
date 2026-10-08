"use client";

import type { ReactElement } from "react";

import { CircleAlertIcon, GraduationCapIcon, UserMinusIcon } from "lucide-react";

import { ActionForm } from "@common/components/action-form";
import { Alert, AlertDescription } from "@common/components/ui/alert";
import { AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@common/components/ui/alert-dialog";
import { Button } from "@common/components/ui/button";
import { Field, FieldLabel } from "@common/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";
import { Textarea } from "@common/components/ui/textarea";

import type { AcademicEnrollmentStatus } from "@features/course-enrollments/types/academic-enrollment-status.types";
import type { CourseEnrollmentActionResult } from "@features/course-enrollments/types/course-enrollment-action-result.types";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";

export function CourseEnrollmentMutationFields({
  formAction,
  mode,
  enrollment,
  state,
  isPending,
  defaultAcademicStatus,
  availableAcademicStatusOptions,
  onOpenChange,
}: {
  formAction: (payload: FormData) => void;
  mode: "withdraw" | "academic";
  enrollment: CourseEnrollment;
  state: CourseEnrollmentActionResult;
  isPending: boolean;
  defaultAcademicStatus: AcademicEnrollmentStatus | undefined;
  availableAcademicStatusOptions: {
    value: "REGULARIZED" | "PROMOTED" | "PASSED" | "FAILED";
    label: string;
  }[];
  onOpenChange: (open: boolean) => void;
}): ReactElement {
  const actionLabel = mode === "withdraw" ? "Registrar baja" : "Registrar resultado";

  return (
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
        <AlertDialogTitle>{actionLabel}</AlertDialogTitle>
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
          {isPending ? "Guardando…" : actionLabel}
        </Button>
      </AlertDialogFooter>
    </ActionForm>
  );
}
