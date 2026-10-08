"use client";

import { useActionState, useEffect, useState, type ReactElement } from "react";

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
import { fetchCourseEnrollmentOptions } from "@features/course-enrollments/services/course-enrollment-client.service";
import { fetchPlatformCourseEnrollmentOptions } from "@features/course-enrollments/services/platform-course-enrollment-client.service";
import type { CourseEnrollmentAssignmentOptions } from "@features/course-enrollments/types/course-enrollment-assignment-options.types";
import { validateEnrollmentAssignment } from "@features/course-enrollments/utils/course-enrollment-assignment-validation.util";
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
  const [options, setOptions] = useState<CourseEnrollmentAssignmentOptions>();
  const [loadError, setLoadError] = useState<string>();
  const [optionsRevision, setOptionsRevision] = useState(0);
  const isLoadingOptions = !options && !loadError;
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

  useEffect(() => {
    let active = true;
    const pending =
      scope === AcademicScope.ADMIN && institutionId
        ? fetchPlatformCourseEnrollmentOptions(institutionId, course.courseId)
        : fetchCourseEnrollmentOptions(course.courseId);
    pending
      .then((value) => {
        if (active) {
          const hasCapacity = value.classes.some((courseClass) =>
            courseClass.days.some(
              (day) =>
                day.availableCapacity !== 0 &&
                day.schedules.some((schedule) => value.format === "GRUPAL" || schedule.individualSlots.some((slot) => slot.available)),
            ),
          );

          if (hasCapacity) {
            setOptions(value);
          } else {
            setLoadError(COURSE_ENROLLMENT_MESSAGES.COURSE_WITHOUT_CAPACITY);
          }
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(error instanceof Error ? error.message : "No se pudieron cargar los horarios.");
        }
      });

    return () => {
      active = false;
    };
  }, [course.courseId, institutionId, scope, optionsRevision]);

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
          setOptions={setOptions}
          setLoadError={setLoadError}
          setOptionsRevision={setOptionsRevision}
          onOpenChange={onOpenChange}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}
