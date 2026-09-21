"use client";

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
import { CircleAlertIcon, Loader2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Field, FieldLabel } from "@common/components/ui/field";
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
    <ActionForm action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="returnTo" value={returnTo} />
      {state.error ? (
        <Alert ref={errorRef} tabIndex={-1} variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>No se pudo registrar la cursada</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="bg-muted/25 grid gap-5 rounded-xl border p-5 sm:grid-cols-2">
        <Field>
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
            getItemLabel={(student) => `${student.lastName}, ${student.firstName} · DNI ${student.documentNumber}`}
            placeholder="Seleccionar estudiante"
          />
        </Field>

        <Field>
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
                <span className="text-muted-foreground truncate text-xs" title={`${course.trainingPathName} · ${course.studyPlanName}`}>
                  {course.trainingPathName} · {course.studyPlanName}
                </span>
              </div>
            )}
            placeholder="Seleccionar curso"
          />
        </Field>
      </div>

      {loadingOptions ? (
        <div className="text-muted-foreground flex items-center gap-2 text-sm" role="status">
          <Loader2Icon className="size-4 animate-spin" /> Cargando clases y horarios…
        </div>
      ) : null}
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

async function fetchCatalog<T>(resource: string, input: AsyncDropdownFetchPageInput): Promise<AsyncDropdownPage<T>> {
  const params = new URLSearchParams({ page: String(input.page), size: String(input.size), search: input.search ?? "" });
  const response = await fetch(`/api/${resource}?${params}`, { cache: "no-store", signal: input.signal });
  return toAsyncDropdownPage(await parseHttpResponse<PaginatedResponse<T>>(response, COURSE_ENROLLMENT_MESSAGES.CATALOG_FAILED));
}
