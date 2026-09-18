"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlertIcon, Loader2Icon } from "lucide-react";

import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Badge } from "@common/components/ui/badge";
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
import { CourseEnrollmentAssignmentFields } from "@features/course-enrollments/components/course-enrollment-assignment-fields";
import { enrollApplicationCourseAction, rejectApplicationCourseAction } from "@features/course-enrollments/actions/course-enrollment.actions";
import { fetchCourseEnrollmentOptions } from "@features/course-enrollments/services/course-enrollment-client.service";
import type { CourseEnrollmentAssignmentOptions } from "@features/course-enrollments/types/course-enrollment-assignment-options.types";
import type { EnrollmentApplicationCourse } from "@features/enrollment-applications/types/enrollment-application-course.types";

type EnrollmentApplicationCoursesManagementProps = {
  applicationId: string;
  courses: readonly EnrollmentApplicationCourse[];
  canEnroll: boolean;
  canReject: boolean;
  canReadWaitlist: boolean;
  readOnly?: boolean;
};

const STATUS_LABELS: Record<EnrollmentApplicationCourse["status"], string> = {
  PENDING: "Pendiente",
  WAITLISTED: "En lista de espera",
  ENROLLED: "Inscripta",
  REJECTED: "Rechazada",
  CANCELLED: "Cancelada",
};

export function EnrollmentApplicationCoursesManagement({
  applicationId,
  courses,
  canEnroll,
  canReject,
  canReadWaitlist,
  readOnly = false,
}: EnrollmentApplicationCoursesManagementProps): React.ReactElement | null {
  const router = useRouter();
  const [courseToEnroll, setCourseToEnroll] = React.useState<EnrollmentApplicationCourse>();
  const [courseToReject, setCourseToReject] = React.useState<EnrollmentApplicationCourse>();

  if (courses.length === 0) {
    return null;
  }

  return (
    <section className="bg-muted/25 rounded-xl border p-5 md:p-6" aria-labelledby="application-courses-title">
      <header className="mb-5 flex flex-col gap-1 border-b pb-5">
        <h2 id="application-courses-title" className="text-base font-semibold">
          Solicitudes de cursada
        </h2>
        <p className="text-muted-foreground text-sm">
          {readOnly
            ? "Consultá el estado de cada curso solicitado y cualquier motivo informado por la institución."
            : "Gestioná cada curso de forma independiente después de aprobar la documentación."}
        </p>
      </header>

      <div className="grid gap-3">
        {courses.map((course) => (
          <article key={course.applicationCourseId} className="bg-background rounded-xl border p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{course.academicSpaceName}</h3>
                  <Badge variant={course.status === "ENROLLED" ? "success" : course.status === "REJECTED" ? "destructive" : "outline"}>
                    {STATUS_LABELS[course.status]}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {course.studyPlanName} · {course.academicLevelName ?? "Sin nivel"}
                  {course.instrumentName ? ` · ${course.instrumentName}` : ""}
                </p>
                {course.waitlistNumber ? (
                  <p className="text-muted-foreground mt-1 text-sm">
                    Número histórico de espera: <span className="font-medium">{course.waitlistNumber}</span>
                  </p>
                ) : null}
                {course.resolutionReasonText ? <p className="text-destructive mt-1 text-sm">{course.resolutionReasonText}</p> : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {canReadWaitlist ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/course-enrollments/${course.courseId}/waitlist`}>Ver espera</Link>
                  </Button>
                ) : null}
                {!readOnly && canEnroll && (course.status === "PENDING" || course.status === "WAITLISTED") ? (
                  <Button size="sm" onClick={() => setCourseToEnroll(course)}>
                    Inscribir
                  </Button>
                ) : null}
                {!readOnly && canReject && (course.status === "PENDING" || course.status === "WAITLISTED") ? (
                  <Button variant="outline" size="sm" onClick={() => setCourseToReject(course)}>
                    Rechazar
                  </Button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      {!readOnly && courseToEnroll ? (
        <EnrollmentApplicationCourseDialog
          applicationId={applicationId}
          course={courseToEnroll}
          open
          onOpenChange={(open) => {
            if (!open) {
              setCourseToEnroll(undefined);
            }
          }}
          onResolved={() => router.refresh()}
        />
      ) : null}
      {!readOnly && courseToReject ? (
        <RejectEnrollmentApplicationCourseDialog
          applicationId={applicationId}
          course={courseToReject}
          open
          onOpenChange={(open) => {
            if (!open) {
              setCourseToReject(undefined);
            }
          }}
          onResolved={() => router.refresh()}
        />
      ) : null}
    </section>
  );
}

type EnrollmentApplicationCourseDialogProps = {
  applicationId: string;
  course: EnrollmentApplicationCourse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolved: () => void;
};

function EnrollmentApplicationCourseDialog({
  applicationId,
  course,
  open,
  onOpenChange,
  onResolved,
}: EnrollmentApplicationCourseDialogProps): React.ReactElement {
  const [options, setOptions] = React.useState<CourseEnrollmentAssignmentOptions>();
  const [loadError, setLoadError] = React.useState<string>();
  const [state, formAction, isPending] = React.useActionState(async (_previous: { error?: string }, formData: FormData) => {
    const result = await enrollApplicationCourseAction(applicationId, course.applicationCourseId, course.version, formData);

    if (!result.error) {
      onOpenChange(false);
      onResolved();
    }

    return result;
  }, {});

  React.useEffect(() => {
    let active = true;
    fetchCourseEnrollmentOptions(course.courseId)
      .then((value) => {
        if (active) {
          setOptions(value);
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
  }, [course.courseId]);

  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => (!isPending ? onOpenChange(nextOpen) : undefined)}>
      <AlertDialogContent className="max-w-2xl">
        <form action={formAction} className="space-y-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Inscribir solicitud de cursada</AlertDialogTitle>
            <AlertDialogDescription>
              {course.academicSpaceName} · {course.studyPlanName} · {course.academicLevelName ?? "Sin nivel"}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {state.error || loadError ? (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{state.error ?? loadError}</AlertDescription>
            </Alert>
          ) : null}
          {!options && !loadError ? (
            <p className="text-muted-foreground flex items-center gap-2 text-sm" role="status">
              <Loader2Icon className="size-4 animate-spin" /> Cargando asignaciones disponibles…
            </p>
          ) : null}
          {options ? <CourseEnrollmentAssignmentFields key={course.courseId} options={options} disabled={isPending} /> : null}

          <AlertDialogFooter>
            <Button type="button" variant="outline" size="lg" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="lg" disabled={isPending || !options}>
              {isPending ? "Inscribiendo…" : "Confirmar inscripción"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function RejectEnrollmentApplicationCourseDialog({
  applicationId,
  course,
  open,
  onOpenChange,
  onResolved,
}: EnrollmentApplicationCourseDialogProps): React.ReactElement {
  const [state, formAction, isPending] = React.useActionState(async (_previous: { error?: string }, formData: FormData) => {
    const reason = formData.get("reason");
    const result = await rejectApplicationCourseAction(
      applicationId,
      course.applicationCourseId,
      course.version,
      typeof reason === "string" ? reason : "",
    );

    if (!result.error) {
      onOpenChange(false);
      onResolved();
    }

    return result;
  }, {});

  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => (!isPending ? onOpenChange(nextOpen) : undefined)}>
      <AlertDialogContent>
        <form action={formAction} className="space-y-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Rechazar solicitud de cursada</AlertDialogTitle>
            <AlertDialogDescription>
              {course.academicSpaceName} · {course.studyPlanName}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {state.error ? (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          <Field>
            <FieldLabel htmlFor="reason" required>
              Motivo
            </FieldLabel>
            <Textarea id="reason" name="reason" maxLength={1000} required disabled={isPending} />
          </Field>
          <AlertDialogFooter>
            <Button type="button" variant="outline" size="lg" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="lg" variant="destructive" disabled={isPending}>
              {isPending ? "Rechazando…" : "Rechazar solicitud"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
