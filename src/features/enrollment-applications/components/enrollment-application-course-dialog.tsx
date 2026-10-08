"use client";

import { useActionState, useState, type ReactElement } from "react";

import { CircleAlertIcon, LoaderCircleIcon } from "lucide-react";

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

import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { enrollApplicationCourseAction } from "@features/course-enrollments/actions/course-enrollment.actions";
import { enrollPlatformApplicationCourseAction } from "@features/course-enrollments/actions/platform-course-enrollment.actions";
import { COURSE_ENROLLMENT_MESSAGES } from "@features/course-enrollments/constants/course-enrollment.constants";
import { useCourseEnrollmentOptions } from "@features/course-enrollments/hooks/use-course-enrollment-options";
import { validateEnrollmentAssignment } from "@features/course-enrollments/utils/course-enrollment-assignment-validation.util";
import { hasEnrollmentCapacity } from "@features/course-enrollments/utils/course-enrollment-capacity.util";
import { ApplicationCourseAssignmentForm } from "@features/enrollment-applications/components/application-course-assignment-form";
import { type EnrollmentApplicationCourseDialogProps } from "@features/enrollment-applications/types/enrollment-application-course-dialog-props.types";

export function EnrollmentApplicationCourseDialog({
  applicationId,
  institutionId,
  scope = AcademicScope.INSTITUTIONAL,
  course,
  open,
  onOpenChange,
  onResolved,
}: EnrollmentApplicationCourseDialogProps): ReactElement {
  const [optionsRevision, setOptionsRevision] = useState(0);
  const query = useCourseEnrollmentOptions({ courseId: course.courseId, institutionId, scope, enabled: open, revision: optionsRevision });
  const hasCapacity = query.options && hasEnrollmentCapacity(query.options);
  const options = hasCapacity ? query.options : undefined;
  const loadError = query.error ?? (query.options && !hasCapacity ? COURSE_ENROLLMENT_MESSAGES.COURSE_WITHOUT_CAPACITY : undefined);
  const isLoadingOptions = query.loading;

  const [state, formAction, isPending] = useActionState<{ error?: string; invalidDayIds?: string[] }, FormData>(async (_previous, formData) => {
    if (!options) {
      return { error: loadError ?? COURSE_ENROLLMENT_MESSAGES.LOADING_ASSIGNMENTS };
    }

    const validation = validateEnrollmentAssignment(formData, options);

    if (!validation.ok) {
      return { error: validation.message, invalidDayIds: validation.invalidDayIds };
    }

    const result = await safelyRunAction(
      scope === AcademicScope.ADMIN && institutionId
        ? enrollPlatformApplicationCourseAction(institutionId, applicationId, course.applicationCourseId, course.version, formData)
        : enrollApplicationCourseAction(applicationId, course.applicationCourseId, course.version, formData),
      COURSE_ENROLLMENT_MESSAGES.MUTATION_UNAVAILABLE,
    );

    if (!result.error) {
      onOpenChange(false);
      onResolved();
    }

    return result;
  }, {});

  if (!options) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            {loadError ? (
              <CircleAlertIcon className="text-destructive size-6" aria-hidden="true" />
            ) : (
              <LoaderCircleIcon className="text-primary size-6 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            )}
            <AlertDialogTitle>{loadError ? "No se puede iniciar la inscripción" : "Comprobando disponibilidad"}</AlertDialogTitle>
            <AlertDialogDescription aria-live="polite">{loadError ?? COURSE_ENROLLMENT_MESSAGES.LOADING_ASSIGNMENTS}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button type="button" size="lg" onClick={() => onOpenChange(false)}>
              {loadError ? "Entendido" : "Cancelar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => (!isPending ? onOpenChange(nextOpen) : undefined)}>
      <AlertDialogContent className="flex h-[min(42rem,calc(100dvh-2rem))] w-[calc(100%-2rem)] min-w-0 flex-col overflow-hidden p-0 sm:max-w-3xl">
        <ApplicationCourseAssignmentForm
          formAction={formAction}
          course={course}
          isLoadingOptions={isLoadingOptions}
          state={state}
          options={options}
          optionsRevision={optionsRevision}
          isPending={isPending}
          onRefreshOptions={() => setOptionsRevision((value) => value + 1)}
          onOpenChange={onOpenChange}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}
