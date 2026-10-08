"use client";

import { useState, type ReactElement } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { BookOpenIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Card, CardContent } from "@common/components/ui/card";

import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { formatStudyPlanName } from "@features/academic/utils/study-plan-label.util";
import { EnrollmentApplicationCourseDialog } from "@features/enrollment-applications/components/enrollment-application-course-dialog";
import { EnrollmentStepCardHeader } from "@features/enrollment-applications/components/enrollment-step-card-header";
import { RejectEnrollmentApplicationCourseDialog } from "@features/enrollment-applications/components/reject-enrollment-application-course-dialog";
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
}: EnrollmentApplicationCoursesManagementProps): ReactElement | null {
  const router = useRouter();
  const [courseToEnroll, setCourseToEnroll] = useState<EnrollmentApplicationCourse>();
  const [courseToReject, setCourseToReject] = useState<EnrollmentApplicationCourse>();

  if (courses.length === 0) {
    return null;
  }

  const waitlistHref = (courseId: string) =>
    scope === AcademicScope.ADMIN && institutionId
      ? `/admin/course-enrollments/${courseId}/waitlist?institutionId=${institutionId}`
      : `/course-enrollments/${courseId}/waitlist`;

  return (
    <Card className="bg-muted/25 sm:[--card-spacing:--spacing(6)]" role="region" aria-labelledby="application-courses-title">
      <EnrollmentStepCardHeader
        icon={BookOpenIcon}
        title="Solicitudes de cursada"
        titleId="application-courses-title"
        description={
          readOnly
            ? "Consultá el estado de cada curso solicitado y cualquier motivo informado por la institución."
            : "Gestioná cada curso de forma independiente después de aprobar la documentación."
        }
      />

      <CardContent className="grid gap-3">
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
      </CardContent>

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
    </Card>
  );
}

export { EnrollmentApplicationCourseDialog } from "@features/enrollment-applications/components/enrollment-application-course-dialog";
