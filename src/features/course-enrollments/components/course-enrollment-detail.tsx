import { CalendarDaysIcon, HistoryIcon, ScrollTextIcon, type LucideIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import { CourseEnrollmentScheduleCards } from "@features/course-enrollments/components/course-enrollment-schedule-cards";
import {
  ACADEMIC_ENROLLMENT_STATUS_LABELS,
  COURSE_ENROLLMENT_STATUS_LABELS,
  COURSE_ENROLLMENT_OPERATION_LABELS,
} from "@features/course-enrollments/constants/course-enrollment.constants";
import { getCourseEnrollmentSituationLabel } from "@features/course-enrollments/utils/course-enrollment-situation.util";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";
import type { CourseEnrollmentHistory } from "@features/course-enrollments/types/course-enrollment-history.types";
import {
  formatEnrollmentApplicationDate,
  formatEnrollmentApplicationDateTime,
} from "@features/enrollment-applications/utils/enrollment-application-date.util";

type CourseEnrollmentDetailProps = {
  enrollment: CourseEnrollment;
  history: CourseEnrollmentHistory[];
};

export function CourseEnrollmentDetail({ enrollment, history }: CourseEnrollmentDetailProps): React.ReactElement {
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
          <Detail label="Plan de estudio" value={enrollment.studyPlanName} />
          <Detail label="Nivel" value={enrollment.academicLevelName ?? "Sin nivel"} />
          <Detail label="Instrumento" value={enrollment.instrumentName ?? "—"} />
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

      <section aria-labelledby="enrollment-history-title" className="bg-muted/25 min-w-0 rounded-xl border p-5 md:p-6">
        <SectionHeader
          id="enrollment-history-title"
          icon={HistoryIcon}
          title="Historial"
          description="Registro de operaciones, cambios de estado y resultados académicos."
        />
        <div className="mt-5">
          {history.length === 0 ? (
            <p className="text-muted-foreground text-sm">No hay movimientos históricos.</p>
          ) : (
            <div className="bg-background overflow-hidden rounded-lg border">
              <Table containerClassName="table-scrollbar" className="min-w-180">
                <TableHeader className="bg-muted">
                  <TableRow className="h-11">
                    <TableHead>Fecha</TableHead>
                    <TableHead>Operación</TableHead>
                    <TableHead>Cursada</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id} className="h-12">
                      <TableCell className="tabular-nums">
                        <time dateTime={item.changedAt}>{formatEnrollmentApplicationDateTime(item.changedAt)}</time>
                      </TableCell>
                      <TableCell>{COURSE_ENROLLMENT_OPERATION_LABELS[item.operation] ?? "Actualización de cursada"}</TableCell>
                      <TableCell>
                        <HistoryStatus
                          previous={item.previousStatus ? COURSE_ENROLLMENT_STATUS_LABELS[item.previousStatus] : null}
                          current={item.newStatus ? COURSE_ENROLLMENT_STATUS_LABELS[item.newStatus] : null}
                        />
                      </TableCell>
                      <TableCell>
                        <HistoryStatus
                          previous={item.previousAcademicStatus ? ACADEMIC_ENROLLMENT_STATUS_LABELS[item.previousAcademicStatus] : null}
                          current={item.newAcademicStatus ? ACADEMIC_ENROLLMENT_STATUS_LABELS[item.newAcademicStatus] : null}
                        />
                      </TableCell>
                      <TableCell className="max-w-80 min-w-40 break-words whitespace-pre-wrap">{item.reason ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  id,
  icon: Icon,
  title,
  description,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}): React.ReactElement {
  return (
    <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
      <div className="flex items-center gap-3.5">
        <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 id={id} className="text-base font-semibold">
            {title}
          </h2>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
    </header>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }): React.ReactElement {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="mt-1 font-semibold break-words">{value}</dd>
    </div>
  );
}

function HistoryStatus({ previous, current }: { previous: string | null; current: string | null }): React.ReactElement {
  if (!current) {
    return <span className="text-muted-foreground">Sin registro</span>;
  }

  if (!previous) {
    return (
      <div className="space-y-1 py-1">
        <p className="text-muted-foreground text-xs">Estado inicial</p>
        <Badge variant="outline">{current}</Badge>
      </div>
    );
  }

  if (previous === current) {
    return (
      <div className="space-y-1 py-1">
        <p className="text-muted-foreground text-xs">Sin cambios</p>
        <Badge variant="outline">{current}</Badge>
      </div>
    );
  }

  return (
    <dl className="space-y-1 py-1 text-sm">
      <div className="flex gap-2">
        <dt className="text-muted-foreground">Antes:</dt>
        <dd>{previous}</dd>
      </div>
      <div className="flex gap-2">
        <dt className="text-muted-foreground">Después:</dt>
        <dd className="font-medium">{current}</dd>
      </div>
    </dl>
  );
}
