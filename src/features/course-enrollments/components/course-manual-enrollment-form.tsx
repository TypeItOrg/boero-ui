"use client";

import { useActionState, useEffect, useRef, useState, type ReactElement } from "react";

import Link from "next/link";

import { CircleAlertIcon } from "lucide-react";

import { ActionForm } from "@common/components/action-form";
import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Skeleton } from "@common/components/ui/skeleton";

import { createManualCourseEnrollmentAction } from "@features/course-enrollments/actions/course-enrollment.actions";
import { CourseEnrollmentAssignmentFields } from "@features/course-enrollments/components/course-enrollment-assignment-fields";
import { CourseManualEnrollmentStudentFields } from "@features/course-enrollments/components/course-manual-enrollment-student-fields";
import { fetchCourseEnrollmentOptions } from "@features/course-enrollments/services/course-enrollment-client.service";
import type { CourseEnrollmentAssignmentOptions } from "@features/course-enrollments/types/course-enrollment-assignment-options.types";
import { validateEnrollmentAssignment } from "@features/course-enrollments/utils/course-enrollment-assignment-validation.util";

type CourseManualEnrollmentFormProps = {
  returnTo: string;
};

export function CourseManualEnrollmentForm({ returnTo }: CourseManualEnrollmentFormProps): ReactElement {
  const errorRef = useRef<HTMLDivElement>(null);
  const [studentId, setStudentId] = useState<string>();
  const [courseId, setCourseId] = useState("");
  const [options, setOptions] = useState<CourseEnrollmentAssignmentOptions | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [state, formAction, isPending] = useActionState<{ error?: string; invalidDayIds?: string[] }, FormData>(async (_previous, formData) => {
    if (options) {
      const validation = validateEnrollmentAssignment(formData, options);

      if (!validation.ok) {
        return { error: validation.message, invalidDayIds: validation.invalidDayIds };
      }
    }

    return createManualCourseEnrollmentAction(formData);
  }, {});

  function handleCourseChange(nextCourseId: string): void {
    setCourseId(nextCourseId);
    setOptions(null);
    setOptionsError(null);
    setLoadingOptions(Boolean(nextCourseId));
  }

  useEffect(() => {
    if (!courseId) {
      return;
    }

    let active = true;

    fetchCourseEnrollmentOptions(courseId)
      .then((nextOptions) => {
        if (active) {
          setOptions(nextOptions);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setOptions(null);
          setOptionsError(error instanceof Error ? error.message : "No se pudieron cargar los horarios.");
        }
      })
      .finally(() => {
        if (active) {
          setLoadingOptions(false);
        }
      });

    return () => {
      active = false;
    };
  }, [courseId]);

  useEffect(() => {
    if (state.error && !isPending) {
      errorRef.current?.scrollIntoView({ block: "center" });
      errorRef.current?.focus({ preventScroll: true });
    }
  }, [state, isPending]);

  return (
    <ActionForm action={formAction} className="flex min-w-0 flex-col gap-5">
      <input type="hidden" name="returnTo" value={returnTo} />
      {state.error ? (
        <Alert ref={errorRef} tabIndex={-1} variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>No se pudo registrar la cursada</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <CourseManualEnrollmentStudentFields
        studentId={studentId}
        setStudentId={setStudentId}
        isPending={isPending}
        courseId={courseId}
        handleCourseChange={handleCourseChange}
      />

      {loadingOptions ? <CourseEnrollmentAssignmentSkeleton /> : null}
      {optionsError ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertDescription>{optionsError}</AlertDescription>
        </Alert>
      ) : null}
      {options ? (
        <CourseEnrollmentAssignmentFields key={courseId} options={options} disabled={isPending} invalidDayIds={state.invalidDayIds} />
      ) : null}

      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <Button asChild type="button" variant="outline" size="lg">
          <Link href={returnTo}>Cancelar</Link>
        </Button>
        <Button type="submit" size="lg" disabled={isPending || !options || loadingOptions}>
          {isPending ? "Registrando…" : "Registrar cursada"}
        </Button>
      </div>
    </ActionForm>
  );
}

function CourseEnrollmentAssignmentSkeleton(): ReactElement {
  return (
    <div className="grid min-w-0 gap-5" role="status" aria-label="Cargando clases y horarios">
      <section className="bg-muted/25 rounded-xl border p-5 md:p-6">
        <div className="-mx-5 flex items-center gap-3.5 border-b px-5 pb-5 md:-mx-6 md:px-6">
          <Skeleton className="size-11 shrink-0 rounded-xl" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        </div>
        <div className="mt-5 grid gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-4 w-56 max-w-full" />
        </div>
      </section>

      <section className="bg-muted/25 rounded-xl border p-5 md:p-6">
        <div className="-mx-5 flex items-center gap-3.5 border-b px-5 pb-5 md:-mx-6 md:px-6">
          <Skeleton className="size-11 shrink-0 rounded-xl" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full max-w-sm" />
          </div>
        </div>
        <div className="bg-background mt-5 flex items-center gap-3 rounded-lg border p-4">
          <Skeleton className="size-4 shrink-0 rounded-sm" />
          <div className="grid gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </section>
    </div>
  );
}
