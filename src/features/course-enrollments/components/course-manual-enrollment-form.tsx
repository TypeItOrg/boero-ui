"use client";

import { formatStudyPlanLabel } from "@features/academic/utils/study-plan-label.util";
import { ActionForm } from "@common/components/action-form";

import Link from "next/link";
import { COURSE_ENROLLMENT_MESSAGES } from "@features/course-enrollments/constants/course-enrollment.constants";
import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import type { AsyncDropdownPage } from "@common/types/async-dropdown-page.types";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { toAsyncDropdownPage } from "@common/utils/to-async-dropdown-page.util";
import * as React from "react";
import { CircleAlertIcon, UserRoundCheckIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Field, FieldLabel } from "@common/components/ui/field";
import { Skeleton } from "@common/components/ui/skeleton";
import { CourseEnrollmentAssignmentFields } from "@features/course-enrollments/components/course-enrollment-assignment-fields";
import { validateEnrollmentAssignment } from "@features/course-enrollments/utils/course-enrollment-assignment-validation.util";
import { createManualCourseEnrollmentAction } from "@features/course-enrollments/actions/course-enrollment.actions";
import { fetchCourseEnrollmentOptions } from "@features/course-enrollments/services/course-enrollment-client.service";
import type { CourseEnrollmentAssignmentOptions } from "@features/course-enrollments/types/course-enrollment-assignment-options.types";
import type { StudentSummary } from "@features/course-enrollments/types/student-summary.types";
import type { Course } from "@features/academic/types/course.types";

type CourseManualEnrollmentFormProps = {
  returnTo: string;
};

export function CourseManualEnrollmentForm({ returnTo }: CourseManualEnrollmentFormProps): React.ReactElement {
  const errorRef = React.useRef<HTMLDivElement>(null);
  const [studentId, setStudentId] = React.useState<string>();
  const [courseId, setCourseId] = React.useState("");
  const [options, setOptions] = React.useState<CourseEnrollmentAssignmentOptions | null>(null);
  const [optionsError, setOptionsError] = React.useState<string | null>(null);
  const [loadingOptions, setLoadingOptions] = React.useState(false);
  const [state, formAction, isPending] = React.useActionState<{ error?: string; invalidDayIds?: string[] }, FormData>(async (_previous, formData) => {
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

  React.useEffect(() => {
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

  React.useEffect(() => {
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

      <section aria-labelledby="manual-enrollment-student-title" className="bg-muted/25 min-w-0 rounded-xl border p-5 md:p-6">
        <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
          <div className="flex items-center gap-3.5">
            <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
              <UserRoundCheckIcon className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="manual-enrollment-student-title" className="text-base font-semibold">
                Estudiante y curso
              </h2>
              <p className="text-muted-foreground text-sm">Seleccioná quién realizará la cursada y el curso al que se incorporará.</p>
            </div>
          </div>
        </header>

        <div className="mt-5 grid min-w-0 gap-5 sm:grid-cols-2">
          <Field className="min-w-0">
            <FieldLabel htmlFor="studentId" required>
              Estudiante
            </FieldLabel>
            <AsyncDropdown<StudentSummary>
              id="studentId"
              name="studentId"
              value={studentId}
              onValueChange={(id) => {
                setStudentId(id);
              }}
              disabled={isPending}
              queryKey={["manual-enrollment-students"]}
              fetchPage={(input) => fetchCatalog<StudentSummary>("students", input)}
              getItemValue={(student) => student.studentId}
              getItemLabel={(student) => `${student.lastName}, ${student.firstName} · ${student.documentNumber}`}
              placeholder="Seleccionar estudiante"
            />
          </Field>

          <Field className="min-w-0">
            <FieldLabel htmlFor="courseId" required>
              Curso
            </FieldLabel>
            <AsyncDropdown<Course>
              id="courseId"
              name="courseId"
              value={courseId}
              onValueChange={(value) => handleCourseChange(value ?? "")}
              disabled={isPending}
              queryKey={["manual-enrollment-courses"]}
              fetchPage={(input) => fetchCatalog<Course>("course-enrollment-options", input)}
              getItemValue={(course) => course.id}
              getItemLabel={(course) =>
                [
                  course.academicSpaceName,
                  course.instrumentName,
                  course.trainingPathName,
                  course.studyPlanName,
                  course.academicLevelName ?? "Sin nivel",
                  course.year,
                ]
                  .filter(Boolean)
                  .join(" · ")
              }
              estimateSize={96}
              renderItem={(course) => (
                <div className="grid min-w-0 gap-1 text-left">
                  <span className="line-clamp-2 font-medium">{course.academicSpaceName}</span>
                  <span className="text-primary text-xs">
                    {[course.academicLevelName ?? "Sin nivel", course.instrumentName, course.year].filter(Boolean).join(" · ")}
                  </span>
                  <span className="text-muted-foreground truncate text-xs" title={formatStudyPlanLabel(course)}>
                    {formatStudyPlanLabel(course)}
                  </span>
                </div>
              )}
              placeholder="Seleccionar curso"
            />
          </Field>
        </div>
      </section>

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

function CourseEnrollmentAssignmentSkeleton(): React.ReactElement {
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

async function fetchCatalog<T>(resource: string, input: AsyncDropdownFetchPageInput): Promise<AsyncDropdownPage<T>> {
  const params = new URLSearchParams({ page: String(input.page), size: String(input.size), search: input.search ?? "" });
  const response = await fetch(`/api/${resource}?${params}`, { cache: "no-store", signal: input.signal });
  return toAsyncDropdownPage(await parseHttpResponse<PaginatedResponse<T>>(response, COURSE_ENROLLMENT_MESSAGES.CATALOG_FAILED));
}
