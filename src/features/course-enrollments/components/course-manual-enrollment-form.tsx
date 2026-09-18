"use client";

import Link from "next/link";
import * as React from "react";
import { useRouter } from "next/navigation";
import { CircleAlertIcon, Loader2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Field, FieldLabel } from "@common/components/ui/field";
import { CourseEnrollmentAssignmentFields } from "@features/course-enrollments/components/course-enrollment-assignment-fields";
import { createManualCourseEnrollmentAction } from "@features/course-enrollments/actions/course-enrollment.actions";
import { fetchCourseEnrollmentOptions } from "@features/course-enrollments/services/course-enrollment-client.service";
import type { CourseEnrollmentAssignmentOptions } from "@features/course-enrollments/types/course-enrollment-assignment-options.types";
import type { StudentSummary } from "@features/course-enrollments/types/student-summary.types";
import type { Course } from "@features/academic/types/course.types";

type CourseManualEnrollmentFormProps = {
  students: readonly StudentSummary[];
  courses: readonly Course[];
  returnTo: string;
};

export function CourseManualEnrollmentForm({ students, courses, returnTo }: CourseManualEnrollmentFormProps): React.ReactElement {
  const router = useRouter();
  const [courseId, setCourseId] = React.useState("");
  const [options, setOptions] = React.useState<CourseEnrollmentAssignmentOptions | null>(null);
  const [optionsError, setOptionsError] = React.useState<string | null>(null);
  const [loadingOptions, setLoadingOptions] = React.useState(false);
  const [state, formAction, isPending] = React.useActionState(async (_previous: { error?: string }, formData: FormData) => {
    const result = await createManualCourseEnrollmentAction(formData);

    if (!result.error) {
      router.push(returnTo);
    }

    return result;
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

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error ? (
        <Alert variant="destructive">
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
          <select
            id="studentId"
            name="studentId"
            defaultValue=""
            required
            disabled={isPending}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
          >
            <option value="">Seleccionar estudiante</option>
            {students.map((student) => (
              <option key={student.studentId} value={student.studentId}>
                {student.lastName}, {student.firstName} · DNI {student.documentNumber}
              </option>
            ))}
          </select>
        </Field>

        <Field>
          <FieldLabel htmlFor="courseId" required>
            Curso
          </FieldLabel>
          <select
            id="courseId"
            name="courseId"
            value={courseId}
            onChange={(event) => handleCourseChange(event.target.value)}
            required
            disabled={isPending}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
          >
            <option value="">Seleccionar curso</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.academicSpaceName} · {course.academicLevelName ?? "Sin nivel"} · {course.studyPlanName} · {course.year}
                {course.instrumentName ? ` · ${course.instrumentName}` : ""}
              </option>
            ))}
          </select>
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
      {options ? <CourseEnrollmentAssignmentFields key={courseId} options={options} disabled={isPending} /> : null}

      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <Button asChild type="button" variant="outline" size="lg">
          <Link href={returnTo}>Cancelar</Link>
        </Button>
        <Button type="submit" size="lg" disabled={isPending || !options || loadingOptions}>
          {isPending ? "Registrando…" : "Registrar cursada"}
        </Button>
      </div>
    </form>
  );
}
