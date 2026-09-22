"use client";

import { formatStudyPlanName } from "@features/academic/utils/study-plan-label.util";
import { ActionForm } from "@common/components/action-form";
import { safelyRunAction } from "@common/utils/safe-action.util";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlertIcon, LoaderCircleIcon } from "lucide-react";

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
import { COURSE_ENROLLMENT_MESSAGES } from "@features/course-enrollments/constants/course-enrollment.constants";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { CourseEnrollmentAssignmentFields } from "@features/course-enrollments/components/course-enrollment-assignment-fields";
import { validateEnrollmentAssignment } from "@features/course-enrollments/utils/course-enrollment-assignment-validation.util";
import { enrollApplicationCourseAction, rejectApplicationCourseAction } from "@features/course-enrollments/actions/course-enrollment.actions";
import {
  enrollPlatformApplicationCourseAction,
  rejectPlatformApplicationCourseAction,
} from "@features/course-enrollments/actions/platform-course-enrollment.actions";
import { fetchCourseEnrollmentOptions } from "@features/course-enrollments/services/course-enrollment-client.service";
import { fetchPlatformCourseEnrollmentOptions } from "@features/course-enrollments/services/platform-course-enrollment-client.service";
import type { CourseEnrollmentAssignmentOptions } from "@features/course-enrollments/types/course-enrollment-assignment-options.types";
import type { EnrollmentApplicationCourse } from "@features/enrollment-applications/types/enrollment-application-course.types";

type EnrollmentApplicationCoursesManagementProps = {
  applicationId: string;
  institutionId?: string;
  scope?: AcademicScope;
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
  institutionId,
  scope = AcademicScope.INSTITUTIONAL,
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

  const waitlistHref = (courseId: string) =>
    scope === AcademicScope.ADMIN && institutionId
      ? `/admin/course-enrollments/${courseId}/waitlist?institutionId=${institutionId}`
      : `/course-enrollments/${courseId}/waitlist`;

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
                  {course.academicYear ? `Ciclo ${course.academicYear} · ` : ""}Plan {formatStudyPlanName(course)} ·{" "}
                  {course.academicLevelName ?? "Sin nivel"}
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
                    <Link href={waitlistHref(course.courseId)}>Ver espera</Link>
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
          institutionId={institutionId}
          scope={scope}
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
          institutionId={institutionId}
          scope={scope}
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
  institutionId?: string;
  scope?: AcademicScope;
  course: EnrollmentApplicationCourse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolved: () => void;
};

export function EnrollmentApplicationCourseDialog({
  applicationId,
  institutionId,
  scope = AcademicScope.INSTITUTIONAL,
  course,
  open,
  onOpenChange,
  onResolved,
}: EnrollmentApplicationCourseDialogProps): React.ReactElement {
  const [options, setOptions] = React.useState<CourseEnrollmentAssignmentOptions>();
  const [loadError, setLoadError] = React.useState<string>();
  const [optionsRevision, setOptionsRevision] = React.useState(0);
  const isLoadingOptions = !options && !loadError;
  const [state, formAction, isPending] = React.useActionState<{ error?: string; invalidDayIds?: string[] }, FormData>(async (_previous, formData) => {
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

  React.useEffect(() => {
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
      </AlertDialogContent>
    </AlertDialog>
  );
}

function RejectEnrollmentApplicationCourseDialog({
  applicationId,
  institutionId,
  scope = AcademicScope.INSTITUTIONAL,
  course,
  open,
  onOpenChange,
  onResolved,
}: EnrollmentApplicationCourseDialogProps): React.ReactElement {
  const [state, formAction, isPending] = React.useActionState(async (_previous: { error?: string }, formData: FormData) => {
    const reason = formData.get("reason");
    const normalizedReason = typeof reason === "string" ? reason : "";
    const result = await safelyRunAction(
      scope === AcademicScope.ADMIN && institutionId
        ? rejectPlatformApplicationCourseAction(institutionId, applicationId, course.applicationCourseId, course.version, normalizedReason)
        : rejectApplicationCourseAction(applicationId, course.applicationCourseId, course.version, normalizedReason),
      COURSE_ENROLLMENT_MESSAGES.MUTATION_UNAVAILABLE,
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
        <ActionForm action={formAction} className="space-y-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Rechazar solicitud de cursada</AlertDialogTitle>
            <AlertDialogDescription>
              {course.academicSpaceName} · {course.academicYear ? `Ciclo ${course.academicYear} · ` : ""}Plan {formatStudyPlanName(course)}
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
        </ActionForm>
      </AlertDialogContent>
    </AlertDialog>
  );
}
