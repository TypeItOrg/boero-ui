import type { ReactElement } from "react";

import { CalendarDaysIcon, ScrollTextIcon } from "lucide-react";

import { OptionalValue } from "@common/components/optional-value";
import { Badge } from "@common/components/ui/badge";

import { formatStudyPlanName } from "@features/academic/utils/study-plan-label.util";
import { Detail, SectionHeader } from "@features/course-enrollments/components/course-enrollment-detail-items";
import { CourseEnrollmentHistorySection } from "@features/course-enrollments/components/course-enrollment-history";
import { CourseEnrollmentScheduleCards } from "@features/course-enrollments/components/course-enrollment-schedule-cards";
import type { CourseEnrollmentHistory } from "@features/course-enrollments/types/course-enrollment-history.types";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";
import { getCourseEnrollmentSituationLabel } from "@features/course-enrollments/utils/course-enrollment-situation.util";
import { formatEnrollmentApplicationDate } from "@features/enrollment-applications/utils/enrollment-application-date.util";

type CourseEnrollmentDetailProps = {
  enrollment: CourseEnrollment;
  history: CourseEnrollmentHistory[];
};

export function CourseEnrollmentDetail({ enrollment, history }: CourseEnrollmentDetailProps): ReactElement {
  const activeSchedules = enrollment.schedules.filter((schedule) => !schedule.releasedAt);
  const releasedSchedules = enrollment.schedules.filter((schedule) => schedule.releasedAt);

  return (
    <div className="flex flex-col gap-4">
      <section aria-labelledby="enrollment-summary-title" className="bg-muted/25 rounded-xl border p-5 md:p-6">
        <SectionHeader
          id="enrollment-summary-title"
          icon={ScrollTextIcon}
          title="Información de la cursada"
          description="Datos del estudiante, el curso y su situación académica."
        />
        <dl className="grid gap-5 pt-5 sm:grid-cols-3">
          <Detail label="Estudiante" value={enrollment.studentName} />
          <Detail label="Curso" value={enrollment.academicSpaceName} />
          <Detail label="Trayecto formativo" value={enrollment.trainingPathName} />
          <Detail label="Plan de estudio" value={formatStudyPlanName(enrollment)} />
          <Detail label="Nivel" value={enrollment.academicLevelName ?? "Sin nivel"} />
          <Detail label="Instrumento" value={<OptionalValue value={enrollment.instrumentName} fallback="Sin instrumento" />} />
          <Detail label="Origen" value={enrollment.source === "APPLICATION" ? "Solicitud de inscripción" : "Alta manual"} />
          <Detail label="Fecha de alta" value={formatEnrollmentApplicationDate(enrollment.enrolledAt)} />
          <Detail label="Clase" value={enrollment.courseClassLabel} />
          <Detail
            label="Situación"
            value={
              <Badge variant={enrollment.status === "ENROLLED" ? "success" : "secondary"}>
                {getCourseEnrollmentSituationLabel(enrollment.status, enrollment.academicStatus)}
              </Badge>
            }
          />
        </dl>
      </section>

      <section aria-labelledby="enrollment-schedules-title" className="bg-muted/25 rounded-xl border p-5 md:p-6">
        <SectionHeader
          id="enrollment-schedules-title"
          icon={CalendarDaysIcon}
          title="Horarios"
          description="Días y franjas horarias asignados a la cursada."
        />
        <div className="space-y-5 pt-5">
          <div>
            {releasedSchedules.length > 0 ? <h3 className="mb-3 text-sm font-semibold">Horarios vigentes</h3> : null}
            {activeSchedules.length > 0 ? (
              <CourseEnrollmentScheduleCards schedules={activeSchedules} />
            ) : (
              <p className="text-muted-foreground text-sm">No hay horarios vigentes.</p>
            )}
          </div>
          {releasedSchedules.length > 0 ? (
            <div>
              <h3 className="mb-2 text-sm font-semibold">Horarios liberados</h3>
              <CourseEnrollmentScheduleCards schedules={releasedSchedules} />
            </div>
          ) : null}
        </div>
      </section>

      <CourseEnrollmentHistorySection history={history} />
    </div>
  );
}
