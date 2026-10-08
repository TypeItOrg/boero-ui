"use client";

import type { Dispatch, ReactElement, SetStateAction } from "react";

import { CircleAlertIcon } from "lucide-react";

import { ActionForm } from "@common/components/action-form";
import { Alert, AlertDescription } from "@common/components/ui/alert";
import { AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@common/components/ui/alert-dialog";
import { Button } from "@common/components/ui/button";

import { CourseEnrollmentAssignmentFields } from "@features/course-enrollments/components/course-enrollment-assignment-fields";
import type { CourseEnrollmentAssignmentOptions } from "@features/course-enrollments/types/course-enrollment-assignment-options.types";
import type { EnrollmentApplicationCourse } from "@features/enrollment-applications/types/enrollment-application-course.types";

export function ApplicationCourseAssignmentForm({
  formAction,
  course,
  isLoadingOptions,
  state,
  options,
  optionsRevision,
  isPending,
  setOptions,
  setLoadError,
  setOptionsRevision,
  onOpenChange,
}: {
  formAction: (payload: FormData) => void;
  course: EnrollmentApplicationCourse;
  isLoadingOptions: boolean;
  state: { error?: string; invalidDayIds?: string[] };
  options: CourseEnrollmentAssignmentOptions | undefined;
  optionsRevision: number;
  isPending: boolean;
  setOptions: Dispatch<SetStateAction<CourseEnrollmentAssignmentOptions | undefined>>;
  setLoadError: Dispatch<SetStateAction<string | undefined>>;
  setOptionsRevision: Dispatch<SetStateAction<number>>;
  onOpenChange: (open: boolean) => void;
}): ReactElement {
  return (
    <ActionForm action={formAction} className="flex min-h-0 min-w-0 flex-1 flex-col">
      <AlertDialogHeader className="shrink-0 items-start border-b p-5 text-left">
        <AlertDialogTitle className="text-left">Inscribir solicitud de cursada</AlertDialogTitle>
        <AlertDialogDescription className="text-left">
          {course.academicSpaceName} · {course.academicYear ? `Ciclo ${course.academicYear} · ` : ""}
          {course.academicLevelName ?? "Sin nivel"}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-5" aria-busy={isLoadingOptions}>
        {state.error ? (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}
        {options ? (
          <CourseEnrollmentAssignmentFields
            key={`${course.courseId}-${optionsRevision}`}
            options={options}
            disabled={isPending}
            invalidDayIds={state.invalidDayIds}
          />
        ) : null}
      </div>
      <AlertDialogFooter className="mx-0 mb-0 shrink-0 sm:flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={isPending || isLoadingOptions}
          onClick={() => {
            setOptions(undefined);
            setLoadError(undefined);
            setOptionsRevision((value) => value + 1);
          }}
        >
          Actualizar horarios
        </Button>
        <Button type="button" variant="outline" size="lg" disabled={isPending} onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button type="submit" size="lg" disabled={isPending || !options}>
          {isPending ? "Inscribiendo…" : "Confirmar inscripción"}
        </Button>
      </AlertDialogFooter>
    </ActionForm>
  );
}
